import {
  isEventFrame,
  type JsonRpcFrame,
  type JsonRpcRequest,
  type JsonRpcResponse,
} from './types'

/**
 * JSON-RPC 2.0 client for the Hermes chat socket (`/api/ws`).
 *
 * One socket serves the whole app. Employees are separate *sessions* on it, not
 * separate connections: `session.create` takes a `profile`, and the server
 * rebinds COMPUTER_HOME per turn and persists to that profile's own state.db.
 * Turns run on per-session threads with no global lock, so several employees
 * genuinely work at once over this single connection.
 *
 * Responsibilities kept here and nowhere else:
 *   - request/response correlation by id
 *   - fan-out of unsolicited `event` frames
 *   - reconnect with backoff, and telling callers when that happened
 *
 * Session lifecycle deliberately lives one layer up in SessionManager: this
 * class knows nothing about employees.
 */

export type ConnectionState =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed'

export interface GatewayEvent {
  type: string
  sessionId?: string
  payload: Record<string, unknown>
}

type EventListener = (event: GatewayEvent) => void
type StateListener = (state: ConnectionState, detail?: string) => void

interface Pending {
  resolve: (value: unknown) => void
  reject: (reason: Error) => void
  timer: ReturnType<typeof setTimeout>
  method: string
}

export class HermesRpcError extends Error {
  constructor(
    readonly code: number,
    message: string,
    readonly method: string,
    readonly data?: unknown,
  ) {
    super(message)
    this.name = 'HermesRpcError'
  }
}

export interface GatewayOptions {
  /** Full ws:// or wss:// URL, token already appended. */
  url: () => string
  /** Per-request timeout. Generous: `session.create` builds an agent. */
  requestTimeoutMs?: number
  maxReconnectDelayMs?: number
  /** Injectable for tests. */
  socketFactory?: (url: string) => WebSocket
}

const DEFAULT_TIMEOUT_MS = 60_000
const DEFAULT_MAX_BACKOFF_MS = 15_000

export class HermesGateway {
  private socket: WebSocket | null = null
  private nextId = 1
  private readonly pending = new Map<number, Pending>()
  private readonly eventListeners = new Set<EventListener>()
  private readonly stateListeners = new Set<StateListener>()
  private state: ConnectionState = 'idle'
  private reconnectAttempt = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private intentionallyClosed = false
  private readyWaiters: Array<() => void> = []

  private readonly requestTimeoutMs: number
  private readonly maxReconnectDelayMs: number
  private readonly socketFactory: (url: string) => WebSocket

  constructor(private readonly options: GatewayOptions) {
    this.requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_TIMEOUT_MS
    this.maxReconnectDelayMs = options.maxReconnectDelayMs ?? DEFAULT_MAX_BACKOFF_MS
    this.socketFactory = options.socketFactory ?? ((url) => new WebSocket(url))
  }

  getState(): ConnectionState {
    return this.state
  }

  onEvent(listener: EventListener): () => void {
    this.eventListeners.add(listener)
    return () => this.eventListeners.delete(listener)
  }

  onStateChange(listener: StateListener): () => void {
    this.stateListeners.add(listener)
    return () => this.stateListeners.delete(listener)
  }

  connect(): void {
    if (this.socket && (this.state === 'open' || this.state === 'connecting')) return
    this.intentionallyClosed = false
    this.open()
  }

  close(): void {
    this.intentionallyClosed = true
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    this.socket?.close()
    this.socket = null
    this.failAllPending(new Error('Gateway closed'))
    this.setState('closed')
  }

  /** Resolves once the socket is open. Rejects if it closes first. */
  async ready(): Promise<void> {
    if (this.state === 'open') return
    this.connect()
    return new Promise((resolve, reject) => {
      const settle = () => {
        off()
        resolve()
      }
      this.readyWaiters.push(settle)
      const off = this.onStateChange((state) => {
        if (state === 'closed') {
          off()
          reject(new Error('Gateway closed before it opened'))
        }
      })
    })
  }

  async request<T>(method: string, params?: Record<string, unknown>): Promise<T> {
    await this.ready()
    const socket = this.socket
    if (!socket || socket.readyState !== WebSocket.OPEN) {
      throw new Error(`Cannot send ${method}: socket is not open`)
    }

    const id = this.nextId++
    const frame: JsonRpcRequest = { jsonrpc: '2.0', id, method, ...(params ? { params } : {}) }

    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id)
        reject(new Error(`${method} timed out after ${this.requestTimeoutMs}ms`))
      }, this.requestTimeoutMs)

      this.pending.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
        timer,
        method,
      })

      try {
        socket.send(JSON.stringify(frame))
      } catch (err) {
        clearTimeout(timer)
        this.pending.delete(id)
        reject(err as Error)
      }
    })
  }

  // ------------------------------------------------------------- internals

  private open(): void {
    this.setState(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting')

    let socket: WebSocket
    try {
      socket = this.socketFactory(this.options.url())
    } catch (err) {
      this.scheduleReconnect((err as Error).message)
      return
    }
    this.socket = socket

    socket.onopen = () => {
      this.reconnectAttempt = 0
      this.setState('open')
      const waiters = this.readyWaiters
      this.readyWaiters = []
      for (const waiter of waiters) waiter()
    }

    socket.onmessage = (event: MessageEvent) => {
      this.handleMessage(event.data)
    }

    socket.onerror = () => {
      // `onclose` always follows; reconnect is handled there so it happens once.
    }

    socket.onclose = (event: CloseEvent) => {
      this.socket = null
      // Anything in flight will never be answered now.
      this.failAllPending(new Error('Socket closed while request was in flight'))

      if (this.intentionallyClosed) {
        this.setState('closed')
        return
      }
      // 4401 auth / 4403 origin are not transient — retrying just spins.
      if (event.code === 4401 || event.code === 4403 || event.code === 4404) {
        this.setState('closed', describeCloseCode(event.code))
        return
      }
      this.scheduleReconnect(describeCloseCode(event.code))
    }
  }

  private handleMessage(raw: unknown): void {
    if (typeof raw !== 'string') return

    let frame: JsonRpcFrame
    try {
      frame = JSON.parse(raw) as JsonRpcFrame
    } catch {
      return // A frame we cannot parse is not worth tearing the socket down for.
    }

    if (isEventFrame(frame)) {
      const { type, session_id: sessionId, payload } = frame.params
      const event: GatewayEvent = {
        type,
        ...(sessionId ? { sessionId } : {}),
        payload: payload ?? {},
      }
      for (const listener of this.eventListeners) {
        try {
          listener(event)
        } catch {
          // One bad subscriber must not stop the others receiving the frame.
        }
      }
      return
    }

    const response = frame as JsonRpcResponse
    const pending = this.pending.get(response.id)
    if (!pending) return
    this.pending.delete(response.id)
    clearTimeout(pending.timer)

    if (response.error) {
      pending.reject(
        new HermesRpcError(
          response.error.code,
          response.error.message,
          pending.method,
          response.error.data,
        ),
      )
      return
    }
    pending.resolve(response.result)
  }

  private scheduleReconnect(detail?: string): void {
    if (this.intentionallyClosed) return
    this.reconnectAttempt += 1
    const delay = Math.min(
      this.maxReconnectDelayMs,
      500 * 2 ** (this.reconnectAttempt - 1),
    )
    this.setState('reconnecting', detail)
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.open()
    }, delay)
  }

  private failAllPending(reason: Error): void {
    for (const [, pending] of this.pending) {
      clearTimeout(pending.timer)
      pending.reject(reason)
    }
    this.pending.clear()
  }

  private setState(state: ConnectionState, detail?: string): void {
    if (this.state === state) return
    this.state = state
    for (const listener of this.stateListeners) {
      try {
        listener(state, detail)
      } catch {
        // ignore
      }
    }
  }
}

/** Hermes close codes, spelled out so a failure is diagnosable from the UI. */
export function describeCloseCode(code: number): string {
  switch (code) {
    case 4401:
      return 'Not authorised — the session token was missing or rejected.'
    case 4403:
      return 'Refused — the request origin is not allowed.'
    case 4404:
      return 'Embedded chat is disabled on this dashboard.'
    case 4408:
      return 'Refused — unrecognised client.'
    case 4409:
      return 'Superseded by a newer connection.'
    case 4410:
      return 'The agent exited.'
    default:
      return `Connection closed (code ${code}).`
  }
}
