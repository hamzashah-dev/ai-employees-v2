import { GROUP_PASS_TEXT } from '@/modules/core/constants/groups'

interface GroupTurnPromptInput {
  /** Transcript lines the member has not seen yet, oldest first. */
  deltaLines: string[]
  groupName: string
  /** Every member of the room, the viewer included. */
  members: string[]
  /** The member about to take a turn. */
  viewer: string
}

/**
 * The whole payload for one member's turn: who else is in the room, what it
 * missed, and how to behave in a room.
 *
 * The rules travel in the turn payload rather than in a profile's system prompt
 * so any existing employee can join a room without being migrated first. Their
 * wording is a behavioural contract carried over verbatim from the desktop
 * plugin — it is what makes rooms *settle* rather than talk themselves into the
 * message cap, so treat an edit here as a product change, not a copy tweak. The
 * pass instruction interpolates `GROUP_PASS_TEXT` because the round loop
 * recognises silence by comparing against that exact constant; a prompt that
 * asked for different words would turn every pass into a posted message.
 */
export function buildGroupTurnPrompt({ groupName, members, viewer, deltaLines }: GroupTurnPromptInput): string {
  const peerNames = members
    .filter((member) => member !== viewer)
    .map((member) => `@${member}`)
    .join(', ')

  return [
    `[Group chat: "${groupName}"] You are @${viewer}, one participant in a group chat with ${peerNames || 'no one else yet'} and the user.`,
    '',
    'New messages in the room since your last turn (oldest first):',
    ...deltaLines.map((line) => `  ${line}`),
    '',
    'Rules for this room:',
    '- Reply with ONE conversational message ONLY if you have something new worth adding: build on what was just said, claim or hand off work, answer a question aimed at you, or report a real result. Keep chatter short (1-3 sentences) — but when you are delivering a result, an answer the user asked for, or substantive work, give it at full quality and length; never thin out real content to fit the room.',
    `- If you have nothing new to add, reply with exactly "${GROUP_PASS_TEXT}". Passing is good — it lets the conversation settle.`,
    '- Mention a teammate as @name to pull them in; mention @user only for a judgment call or a result the user needs. Do not repeat points already made.',
    '- Never reveal content from your private 1:1 chats. Your reply text goes to the room verbatim — no preamble, no meta-commentary.',
  ].join('\n')
}
