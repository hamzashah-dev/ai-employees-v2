import { loadGroupRooms, saveGroupRooms } from '../../services/group-persistence'
import { useGroupStore } from '../../stores/group-store'

/**
 * Bridges the room store to this device's storage.
 *
 * Both halves run at MODULE scope, on purpose. Hydration has to beat the first
 * render or the rooms list flashes empty; the write subscription has to outlive
 * the surface, because a round keeps committing replies long after the user has
 * navigated away from Groups — an effect-scoped subscription would drop exactly
 * the messages that arrived while nobody was looking.
 */

const stored = loadGroupRooms()
if (Object.keys(stored).length) {
  useGroupStore.setState({ rooms: stored })
}

// Rooms are small and change at human speed — one send, one reply — so writing
// on every change costs nothing and debouncing would only add a lost-write
// window.
useGroupStore.subscribe((state, previous) => {
  if (state.rooms !== previous.rooms) saveGroupRooms(state.rooms)
})

/**
 * Kept as a hook so the surface still declares its dependency on persistence
 * being wired, even though the wiring itself is module-level.
 */
export function useGroupPersistence(): void {}
