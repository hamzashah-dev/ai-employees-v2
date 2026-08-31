/**
 * Whether a finished member turn may still commit — append its reply and
 * advance its watermark.
 *
 * A turn dispatched under an older epoch was superseded mid-flight by a newer
 * user send. Its late result is normally dropped, because that send's own round
 * loop re-drives this member with the full delta and committing both is exactly
 * the double-delivery bug the epoch exists to prevent.
 *
 * That re-drive premise only holds for a send in the SAME thread, since deltas
 * are thread-scoped: a cross-thread send bumps the epoch but its loop never
 * regenerates this reply, so dropping it there loses finished work outright.
 * Callers pass whether a newer USER entry landed in this thread since dispatch;
 * the default keeps the conservative drop for a caller that cannot tell.
 */
export function shouldCommitMemberTurn(
  epochAtDispatch: number,
  currentEpoch: number,
  newerUserEntryInThread = true,
): boolean {
  if (epochAtDispatch === currentEpoch) return true

  return !newerUserEntryInThread
}
