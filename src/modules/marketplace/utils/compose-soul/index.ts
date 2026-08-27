import type { CatalogAgent } from '../../constants/catalog'

/**
 * Build the `SOUL.md` an agent is installed with.
 *
 * ## Why this exists
 *
 * `POST /api/profiles` copies the bundled skills and writes the description, but
 * leaves SOUL.md as the stock Computer Agent boilerplate. Every hired agent
 * therefore had the right tools and no identity: a "LinkedIn Agent" answered
 * "I'm Computer Agent — I can write code, handle email…". Two agents carry a
 * hand-authored `soul`; without a fallback the other ninety-five all behave that
 * way, so the fix has to scale to the whole catalog rather than the two entries
 * we happened to write.
 *
 * ## Why it quotes instead of rewriting
 *
 * The catalog is third-person product copy and a SOUL is a second-person
 * instruction, and the pronouns do not survive the trip. "Sorts the overnight
 * inbox and tells **you** the three things that need you" means the *owner* —
 * addressed to the agent it reads as the agent's own inbox. Rewriting that
 * automatically means guessing which "you" is which, and getting it wrong
 * inverts the instruction.
 *
 * So the tagline is quoted verbatim as what the role was advertised as, which is
 * both true and grammatical, and the duty lines are laid out as a checklist
 * where third-person reads naturally. Nothing is paraphrased and no fact is
 * added: everything here is already on the card the user clicked.
 *
 * A hand-authored `soul` always wins — it can say things the card cannot, like
 * which skill steps to refuse.
 */
export function composeSoul(agent: CatalogAgent): string {
  if (agent.soul) return agent.soul

  const lines = [`# ${agent.name}`, '']

  lines.push(
    `You are **${agent.name}**, an AI employee. This is how the role was described`,
    'to the person who hired you:',
    '',
    `> ${agent.tagline}`,
    '',
  )

  if (agent.duties) {
    lines.push('**What you do**')
    for (const duty of agent.duties) lines.push(`- ${duty}`)
    lines.push('')
  }

  if (agent.howItWorks) {
    lines.push('**How you work**')
    for (const rule of agent.howItWorks) lines.push(`- ${rule}`)
    lines.push('')
  }

  // The closing rules are the only sentences not lifted from the card.
  //
  // The first makes a one-line tagline into a usable brief: without it an agent
  // with no duties has an identity but no boundary, and answers anything.
  //
  // The second exists because of an observed failure, not a hypothetical. Asked
  // to open a LinkedIn page, an agent hit the logged-out wall and reasoned
  // itself into a dead end on-screen: "my role is about not posting/commenting
  // /reacting — logging in is similarly an interactive action... I genuinely
  // cannot log in without credentials", then gave up and explained why. Every
  // premise there was right and the conclusion was wrong: it can ask, a human
  // can sign in inside the same browser it is driving, and the session persists
  // afterwards. A do-not-act rule reads as do-not-ask unless you say otherwise.
  lines.push(
    'Do that job. If you are asked for something outside it, say so in one line',
    'and name who or what would do it instead — do not quietly take the work on.',
    '',
    '**When a site wants a sign-in**',
    'Stop and ask, with the `clarify` tool — do not give up and explain, and do',
    'not treat a login as one of the actions you are told not to take. You are',
    'looking at a real browser the person can see and click. Say which site needs',
    'the sign-in, tell them it is the browser on their screen, and wait. You never',
    'type anyone\'s credentials yourself and never ask for a password in chat.',
    'Once they say they are done, carry on with the original task from where you',
    'stopped — the session stays signed in, so this happens once, not every run.',
  )

  return lines.join('\n')
}
