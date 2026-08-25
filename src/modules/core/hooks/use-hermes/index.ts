import { useEffect } from 'react'
import { HermesGateway } from '../../services/hermes/gateway'
import { SessionManager } from '../../services/hermes/session-manager'
import { gatewaySocketUrl } from '../../services/hermes/config'
import { fetchProfiles } from '../../services/hermes/rest'
import { useChatStore } from '../../stores/chat-store'

/**
 * Boots the single gateway connection and wires it into the chat store.
 *
 * Mounted once, at the app shell. Everything downstream reads the store rather
 * than touching the socket, so there is exactly one connection and one place
 * where events become state.
 */

let singleton: { gateway: HermesGateway; sessions: SessionManager } | null = null

export function getHermes(): { gateway: HermesGateway; sessions: SessionManager } {
  if (!singleton) {
    const gateway = new HermesGateway({ url: gatewaySocketUrl })
    const sessions = new SessionManager(gateway, {
      listProfileNames: async () => (await fetchProfiles()).map((p) => p.name),
    })
    singleton = { gateway, sessions }
  }
  return singleton
}

export function useHermesConnection(): void {
  useEffect(() => {
    const { gateway, sessions } = getHermes()
    useChatStore.getState().bind(sessions)

    // Subscriptions are re-established on every run, never skipped. A `ref`
    // guard here looks like it stops StrictMode's double-invoke from opening
    // two sockets, but the socket is a module singleton and `connect()` is
    // already idempotent — all the guard achieves is letting the first run's
    // cleanup tear these listeners down while the second run skips re-adding
    // them. The socket then opens with nobody listening and the UI sits on
    // "Connecting…" forever.
    const offEvent = gateway.onEvent((event) => {
      useChatStore.getState().applyEvent(event)
    })
    const offState = gateway.onStateChange((state, detail) => {
      useChatStore.getState().setConnection(state, detail)
    })

    gateway.connect()

    // The socket may already be open — on a StrictMode remount, or whenever a
    // later consumer mounts. No further state change would fire, so read the
    // current state once rather than waiting for an event that already passed.
    useChatStore.getState().setConnection(gateway.getState())

    return () => {
      offEvent()
      offState()
      // The socket deliberately outlives the component: it is app-scoped, and
      // closing it here would drop in-flight turns on every navigation.
    }
  }, [])
}
