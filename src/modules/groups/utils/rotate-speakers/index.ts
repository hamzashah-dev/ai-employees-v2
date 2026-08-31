/**
 * Rotate the roster so a different member leads each round.
 *
 * Whoever speaks first sets the frame for the round, and a fixed order would
 * hand that to the same member every time — the first seat would dominate a
 * three-round conversation. Rotation is by round index rather than random so a
 * replayed room produces the same transcript.
 */
export function rotateGroupSpeakers(members: string[], round: number): string[] {
  // 0 and 1 members are both no-ops, and the early return is also what keeps
  // the modulo below from dividing by zero on an empty roster.
  if (members.length < 2) return members

  // Normalised into range: a negative or fractional round would otherwise
  // produce a shift that slices from the wrong end or lands between seats.
  const shift =
    ((Math.trunc(round) % members.length) + members.length) % members.length

  return [...members.slice(shift), ...members.slice(0, shift)]
}
