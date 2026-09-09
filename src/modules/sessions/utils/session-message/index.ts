import type { SessionMessage } from '../../types'

/**
 * `GET /api/sessions/:id/messages` answers `Record<string, unknown>[]` — the
 * REST layer does not type it further, because the shape is whatever the
 * stored transcript happened to serialise (the wire's own `HermesWireMessage`
 * covers the gateway's live event shape, not this endpoint's history rows).
 * Narrowed here rather than trusted, the same defensiveness `toSessionRows`
 * applies to the sidebar payload.
 */
function textOf(content: unknown): string {
  if (typeof content === 'string') return content
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === 'string') return part
        if (part && typeof part === 'object' && 'text' in part) {
          const text = (part as { text?: unknown }).text
          return typeof text === 'string' ? text : ''
        }
        return ''
      })
      .join('')
  }
  return ''
}

function roleOf(value: unknown): SessionMessage['role'] {
  return value === 'user' || value === 'assistant' || value === 'system' ? value : 'other'
}

export function toSessionMessage(raw: Record<string, unknown>, index: number): SessionMessage {
  const text = typeof raw.text === 'string' ? raw.text : textOf(raw.content)
  const id = typeof raw.id === 'string' ? raw.id : `${index}`

  return { id, role: roleOf(raw.role), text: text.trim() }
}
