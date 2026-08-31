import { useEffect, useRef } from 'react'
import type { FC } from 'react'
import { EmployeeAvatar } from '@/modules/core/components/employee-avatar'
import { Spinner } from '@/modules/core/components/spinner'
import type { GroupMessage } from '@/modules/core/types/groups'

interface GroupMessageListProps {
  messages: GroupMessage[]
  /**
   * The label the viewer's own entries carry in `from.name`. Ownership is
   * decided by name rather than by `from.kind` alone so a second person's words
   * are never drawn as if the reader had typed them.
   */
  viewer: string
  /** Members with a turn in flight right now. */
  membersTyping: string[]
}

/**
 * The room transcript.
 *
 * The one thing this does that the one-to-one thread does not is *name every
 * speaker*. A thread has exactly two voices and can afford an unlabelled
 * bubble; a room has up to six, and an unattributed paragraph in a six-way
 * conversation is unreadable. So a member entry is a left-aligned column under
 * its own name and avatar, and only the viewer's own words get the right-hand
 * bubble.
 */
export const GroupMessageList: FC<GroupMessageListProps> = ({
  messages,
  viewer,
  membersTyping,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  /*
   * A round can add half a dozen entries while the user watches, and none of
   * them are worth much if the column stays parked where it was. This pins to
   * the bottom unconditionally rather than honouring a scroll-up, which the
   * thread's `useStickToBottom` does — that hook lives in another feature
   * module and the boundary rule forbids reaching for it.
   */
  useEffect(() => {
    const node = scrollRef.current
    if (!node) return
    node.scrollTop = node.scrollHeight
  }, [messages.length, membersTyping.length])

  return (
    <div ref={scrollRef} className="scrollbar-minimal min-h-0 flex-1 overflow-y-auto px-6">
      <div
        role="log"
        aria-label="Room transcript"
        aria-live="polite"
        className="mx-auto flex max-w-[768px] flex-col gap-5 py-6"
      >
        {messages.map((message) => (
          <GroupEntry key={message.id} message={message} viewer={viewer} />
        ))}

        {membersTyping.map((member) => (
          <WorkingRow key={`working:${member}`} member={member} />
        ))}
      </div>
    </div>
  )
}

const GroupEntry: FC<{ message: GroupMessage; viewer: string }> = ({ message, viewer }) => {
  const mine = message.from.kind === 'user' && message.from.name === viewer

  /*
   * Plain text, not markdown: what someone typed should appear exactly as they
   * typed it, and a member's reply is quoted back into other members' prompts
   * verbatim — rendering it differently here than it travels would be its own
   * small lie.
   */
  if (mine) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[256px] rounded-[20px] bg-fill-elevated px-4 py-2.5 text-body-md break-words whitespace-pre-wrap text-primary tablet:max-w-[364px] laptop:max-w-[512px]">
          {message.text}
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      {message.from.kind === 'member' ? (
        <EmployeeAvatar profile={message.from.name} size={28} className="mt-0.5" />
      ) : (
        // A user entry that is not the viewer's own has no bot to draw: Hermes
        // keeps no avatar for a person.
        <span aria-hidden className="mt-0.5 size-7 shrink-0 rounded-full bg-fill-elevated" />
      )}

      <div className="flex min-w-0 flex-col gap-1">
        <p className="text-label-sm font-medium text-secondary">{message.from.name}</p>
        <p className="text-body-md break-words whitespace-pre-wrap text-primary">{message.text}</p>
      </div>
    </div>
  )
}

/**
 * A member whose model call is in flight.
 *
 * Deliberately not a percentage and not an elapsed clock: a turn's only honest
 * states are running and finished, and the round loop polls rather than
 * streaming progress. §1e names this the only turn-order cue in the product —
 * everything else about the rotation stays invisible.
 */
const WorkingRow: FC<{ member: string }> = ({ member }) => (
  <div className="flex items-center gap-3">
    <EmployeeAvatar profile={member} size={28} />
    <span className="flex items-center gap-1.5 text-label-sm text-tertiary">
      <Spinner />
      {member} is typing…
    </span>
  </div>
)
