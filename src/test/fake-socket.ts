/**
 * A WebSocket stand-in that lets a test drive both directions.
 *
 * The gateway's whole job is framing and correlation, so the tests need to
 * assert on exact bytes sent and to push exact frames back — including the
 * unsolicited `event` frames, which have no request to correlate against.
 */
export class FakeSocket {
  static readonly CONNECTING = 0
  static readonly OPEN = 1
  static readonly CLOSING = 2
  static readonly CLOSED = 3

  readyState: number = FakeSocket.CONNECTING
  sent: string[] = []

  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onerror: (() => void) | null = null
  onclose: ((event: { code: number; reason?: string }) => void) | null = null

  constructor(readonly url: string) {}

  send(data: string): void {
    this.sent.push(data)
  }

  close(): void {
    this.readyState = FakeSocket.CLOSED
    this.onclose?.({ code: 1000 })
  }

  // ------------------------------------------------------------ test driver

  open(): void {
    this.readyState = FakeSocket.OPEN
    this.onopen?.()
  }

  /** Push a raw frame from the "server". */
  receive(frame: unknown): void {
    this.onmessage?.({ data: typeof frame === 'string' ? frame : JSON.stringify(frame) })
  }

  /** Reply to the Nth sent request with a result. */
  reply(id: number, result: unknown): void {
    this.receive({ jsonrpc: '2.0', id, result })
  }

  replyError(id: number, code: number, message: string): void {
    this.receive({ jsonrpc: '2.0', id, error: { code, message } })
  }

  event(type: string, sessionId: string | undefined, payload: Record<string, unknown>): void {
    this.receive({
      jsonrpc: '2.0',
      method: 'event',
      params: { type, ...(sessionId ? { session_id: sessionId } : {}), payload },
    })
  }

  drop(code = 1006): void {
    this.readyState = FakeSocket.CLOSED
    this.onclose?.({ code })
  }

  /** The parsed frames this socket was asked to send. */
  parsedSent(): Array<{ id: number; method: string; params?: Record<string, unknown> }> {
    return this.sent.map(
      (raw) => JSON.parse(raw) as { id: number; method: string; params?: Record<string, unknown> },
    )
  }
}
