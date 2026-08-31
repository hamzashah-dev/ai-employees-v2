import { useId, useState, type FC, type KeyboardEvent } from 'react'
import { CheckCircleFilledIcon } from '@repo/icons/check-circle-filled'
import { EyeIcon } from '@repo/icons/eye-icon'
import { EyeSlashIcon } from '@repo/icons/eye-slash-icon'
import { HourglassIcon } from '@repo/icons/hourglass-icon'
import { LockIcon } from '@repo/icons/lock-icon'
import { QuestionCircleIcon } from '@repo/icons/question-circle-icon'
import { ShieldCheckIcon } from '@repo/icons/shield-check'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import {
  Dialog,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui/dialog'
import { WithTooltip } from '@repo/ui/tooltip'
import { Spinner } from '@/modules/core/components/spinner'

/**
 * Hand-rolled because `@repo/ui` ships no text field — `packages/ui/src` contains no
 * `<input>` or `<textarea>` anywhere. Same class list the vault rows and the marketplace's
 * requirement row use, so all three credential surfaces read as one product.
 *
 * `pr-10` is load-bearing: the reveal toggle is absolutely positioned inside the field, and
 * without the reserve a long key runs underneath it.
 */
const FIELD =
  'h-10 w-full min-w-0 rounded-xl border border-secondary bg-fill px-3 pr-10 text-label-md text-primary placeholder:text-tertiary focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none disabled:text-tertiary'

/** Shared by the two square icon controls — the header's help dot and the field's reveal. */
const ICON_BUTTON =
  'flex shrink-0 cursor-pointer items-center justify-center text-tertiary outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-default disabled:hover:text-tertiary'

/**
 * Both terminal states collapse to the design's one-line system note (§1c): 10/14 padding,
 * a 16px icon and one 12px line, on `bg-fill` rather than the card's `bg-fill-elevated` so
 * it reads as transcript furniture and not as something still waiting on you.
 */
/**
 * The docked shell, shared by every state.
 *
 * `rounded-b-none`: the panel sits flush on top of the prompt box, which drops
 * its own top rounding and top border when a panel is present (see `Composer`'s
 * `above` slot). The panel KEEPS its bottom border, so the seam is exactly one
 * hairline — drawn by the panel, not by both edges stacked.
 *
 * `bg-fill-variant` matches the prompt box exactly, so the pair reads as one
 * container instead of a card resting on a different surface.
 */
const DOCKED =
  'w-full shrink-0 rounded-3xl rounded-b-none border border-primary bg-fill-variant'

const NOTE = `flex items-center gap-2 px-4 py-3 ${DOCKED}`

/**
 * "What happens to a key you paste here" — the design's three answers, in its order.
 *
 * The first two are the design's own words and both are literally true: the value goes to
 * `save_env_value_secure` → that profile's `.env` (`computer_cli/config.py`), and the tool
 * result Hermes puts back in the stream carries only `stored_as` / `validated` / `skipped`,
 * never the value. Profiles do not inherit each other's `.env` either, so "read by another
 * employee" is accurate rather than reassuring.
 *
 * The third is deliberately NOT the design's line. The canvas promises "only the last four
 * characters are ever shown again", and that is false: `POST /api/env/reveal` returns the
 * real value to whoever holds the session token. It is gated — 5 reveals per 30s
 * process-wide, and every one written to the server log — so that gating is what this says
 * instead. A security promise the backend does not keep is the one lie this card cannot
 * afford.
 */
const FATE = [
  'It goes to the Hermes install on this machine and is stored with that employee’s profile — not with the conversation.',
  'It is never written into the transcript, so it can’t be scrolled back to, searched, or read by another employee.',
  'Afterwards this card is done with it: the vault lists the key masked, revealing it there is rate-limited and logged on the server, and you can remove it any time from Settings › Vault.',
] as const

/**
 * "Rules this card follows" — the four rules from §1d, each verbatim as its statement, with
 * the supporting line underneath.
 *
 * Two of the four supports are the design's; two are not, for the same reason as above:
 *
 * - Reveal's support states what the code does — `clear()` runs before `onSubmit`, so the
 *   field is masked again before the value leaves the component.
 * - No countdown's support drops the canvas's "an hour by default, 'never' when set to
 *   zero". That is the *clarify* timeout. `secret.request` goes through `_block` with no
 *   timeout argument, so it takes the 300s default (`tui_gateway/server.py`) and then the
 *   gateway emits `secret.expire`. Five minutes, always, and not ours to configure.
 */
const RULES = [
  {
    rule: 'Masked by default.',
    detail: 'The field is a password field until you press the eye.',
  },
  {
    rule: 'Reveal is a deliberate press, and it never survives submit.',
    detail: 'Submitting re-masks the field before the value leaves this card.',
  },
  {
    rule: 'Never a chat message.',
    detail:
      'Typing a key into the composer is the failure this card exists to prevent, so the composer stays available but the ask is answered above it.',
  },
  {
    rule: 'No countdown.',
    detail:
      'The wait is bounded at five minutes and Hermes says when it lapses — a clock drawn here would be counting a deadline this card cannot see.',
  },
] as const

/**
 * The provider name, but only when there provably is one.
 *
 * `secretLabel` (see `modules/thread/utils/secret-label`) builds `"<provider> · <kind>"` only
 * for env vars whose vendor is unambiguous, and otherwise hands back the bare variable name
 * — it refuses to guess a vendor from the prompt. The separator is therefore the only
 * evidence a provider is known, and where it is missing this panel says "this key" rather
 * than re-introducing the guess one layer up.
 */
const providerOf = (label: string): string | undefined => {
  const [provider, ...rest] = label.split(' · ')
  return rest.length > 0 ? provider : undefined
}

interface SecretKeyCardProps {
  /** Already humanised for display, e.g. 'Fal AI · API key'. */
  label: string
  /** The variable Hermes will write, e.g. 'FAL_KEY' — the card's secondary detail. */
  envVar: string
  /** Optional guidance carried on the request's metadata. */
  help?: string
  onSubmit: (value: string) => void
  onSkip: () => void
  isSubmitting: boolean
  /**
   * Set once Hermes has written the variable, which collapses the card to a confirmation.
   *
   * `last4` is computed by the caller on purpose: the card hands the value to `onSubmit` and
   * forgets it in the same tick, so it has nothing left to slice. Nothing here claims the
   * key *works* — `save_env_value_secure` returns `validated: False` and Hermes has no
   * validator, so "saved" is the only thing that can honestly be said.
   *
   * Not wired yet: `submitSecret` clears the request on success and the store keeps no
   * record of the write, so no caller can pass this until it does.
   */
  saved?: { envVar: string; last4: string }
  /**
   * The ask lapsed. `_block('secret.request', …)` takes the 300s default and then emits
   * `secret.expire`; the tool has already been told the key was declined by the time this
   * renders, so nothing was saved and nothing is still parked.
   *
   * Not wired yet either: `reduceEvent` drops the request on `secret.expire`
   * (`chat-store.ts` → `clearSecret`), so today the card unmounts instead of showing this.
   * Rendering it needs the store to keep the request and flag it.
   */
  expired?: boolean
}

/**
 * A skill has stopped mid-run because a credential it needs is not on this employee.
 *
 * The agent thread is genuinely parked while this card is up — the tool is blocked inside
 * `_block("secret.request", …)` — so the two buttons are the only two ways the turn
 * continues: a value, or the skip that lets the tool report back that the key was declined.
 * That block is bounded at 300s, which is what `expired` is for.
 *
 * **"Never printed in the transcript" is a fact, not reassurance.** The tool result carries
 * only the variable name and whether it was saved; the value goes into the profile's own
 * `.env` at 0600 and never into the message stream. Correspondingly, nothing here keeps the
 * value either: it lives in this component's state until submit, and submit hands it
 * straight to the caller and clears it. It is never logged, never put in an error, and never
 * parked in the store.
 *
 * **There is no "checking the key" state.** The canvas draws one ("Checking the key with Fal
 * AI"), but Hermes validates nothing — `save_env_value_secure` returns `validated: False`
 * and there is no validator behind it — so that spinner would be waiting on nothing and
 * there is correspondingly no rejected state either. Submit means saved.
 *
 * Presentational on purpose — the card knows nothing about the gateway, so the request/respond
 * pairing stays in one place and this stays testable without a socket.
 */
export const SecretKeyCard: FC<SecretKeyCardProps> = ({
  label,
  envVar,
  help,
  onSubmit,
  onSkip,
  isSubmitting,
  saved,
  expired,
}) => {
  const [value, setValue] = useState('')
  const [revealed, setRevealed] = useState(false)
  const titleId = useId()
  const fieldId = useId()

  /*
   * Trimmed for the *gate* so a stray space is not a submittable key, but the value itself
   * goes to the caller byte-for-byte — a secret is opaque, and silently editing a credential
   * is how you get an unexplainable 401 later.
   */
  const canSubmit = value.trim().length > 0 && !isSubmitting

  const clear = (): void => {
    setValue('')
    setRevealed(false)
  }

  const submit = (): void => {
    if (!canSubmit) return
    const secret = value
    /*
     * Before `onSubmit`, not after: the reveal must not survive the submit, and the value
     * must not survive it either. A caller that re-renders synchronously therefore cannot
     * catch the field either revealed or populated.
     */
    clear()
    onSubmit(secret)
  }

  const skip = (): void => {
    clear()
    onSkip()
  }

  const onFieldKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    /*
     * Both keys stop here. The panel is docked inside the composer's `<form>`, so
     * `preventDefault` is what stops Enter triggering that form's implicit
     * submit — which would reload the page — and `stopPropagation` keeps either
     * key from reaching the composer's own handlers above us.
     */
    if (event.key === 'Enter') {
      event.preventDefault()
      event.stopPropagation()
      submit()
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      skip()
    }
  }

  /*
   * Saved outranks expired: a write that landed is the truth about this ask, whatever the
   * clock did afterwards.
   */
  if (saved) {
    return (
      /* `role="status"` and no name: the line *is* the announcement, and a region name on
       * top of it would have a screen reader read the sentence twice. */
      <section role="status" className={NOTE}>
        <LockIcon className="size-4 shrink-0 stroke-[1.2px] text-success" />
        <p className="min-w-0 flex-1 text-label-sm text-secondary">
          {/*
           * No "key" inserted before "saved": `label` already ends in the credential kind
           * ("Fal AI · API key", "Fal AI · secret", or a bare variable name), so adding the
           * word would read as "Fal AI · secret key saved" on half the vocabulary.
           */}
          {label} saved — ends <span className="font-mono text-primary">{saved.last4}</span>.{' '}
          <span className="font-mono text-primary">{saved.envVar}</span> is set on this employee
          now, so it can use the key. You can remove it any time from Settings › Vault.
        </p>
      </section>
    )
  }

  if (expired) {
    return (
      <section role="status" className={NOTE}>
        <HourglassIcon className="size-4 shrink-0 text-tertiary" />
        <p className="min-w-0 flex-1 text-label-sm text-secondary">
          This ask timed out and nothing was saved. Ask again when you have the key to hand.
        </p>
        {/*
         * One way out, and it is the same one: a late `secret.respond` is tolerated
         * (`allow_expired=True`), so whether the caller answers the dead request or just
         * clears the card, dismissing is safe.
         */}
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={onSkip}
          className="shrink-0 text-secondary"
        >
          Dismiss
        </Button>
      </section>
    )
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={isSubmitting}
      className={cn(
        'flex flex-col',
        DOCKED,
        /* §1c's "the card locks, nothing else moves" — the canvas dims the whole card. */
        { 'opacity-70': isSubmitting },
      )}
    >
      <div className="flex items-center gap-2 border-b border-primary px-4 py-3">
        <LockIcon className="size-4 shrink-0 stroke-[1.2px] text-secondary" />
        <h2 id={titleId} className="min-w-0 flex-1 text-label-lg font-medium text-primary">
          Add secret key
        </h2>

        <WithTooltip
          content={
            <span className="flex flex-col gap-1">
              <span className="font-mono text-label-xs">{envVar}</span>
              <span className="text-label-xs">What happens to this key</span>
            </span>
          }
          size="sm"
          showArrow={false}
          className="inline-flex shrink-0"
          tooltipContentProps={{ side: 'bottom', sideOffset: 6, className: 'max-w-60' }}
        >
          {/*
           * The tooltip wraps its child in a div, so the hover hint and the dialog trigger
           * are two different elements and neither has to merge props with the other.
           */}
          <Dialog>
            <DialogTrigger asChild>
              <button
                type="button"
                aria-label={`About ${envVar}`}
                className={cn(ICON_BUTTON, 'size-6 rounded-full border border-secondary')}
              >
                <QuestionCircleIcon className="size-3.5 stroke-[1.4px]" />
              </button>
            </DialogTrigger>

            <HelpPanel label={label} envVar={envVar} help={help} />
          </Dialog>
        </WithTooltip>
      </div>

      {/*
        * A plain div, NOT a form. This panel is docked inside the composer's
        * `<form>` (see `Composer`'s `above` slot), and nested forms are invalid
        * HTML — the parser drops the inner one, which silently reassigns any
        * `type="submit"` inside it to the OUTER form and turns a click into a
        * native page navigation. Submitting is driven by the button's onClick
        * and by Enter in the field, both of which stop the event from reaching
        * the composer.
        */}
      <div className="flex flex-col gap-4 px-4 py-3.5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={fieldId} className="text-label-sm font-medium text-secondary">
            {label}
          </label>

          <div className="relative flex items-center">
            <input
              id={fieldId}
              /*
               * No `name`, and autofill off in every dialect a manager reads: this field is
               * one variable on one employee, not a login, and a manager filling it would
               * write somebody's password into an agent's `.env`.
               */
              type={revealed ? 'text' : 'password'}
              value={value}
              autoComplete="off"
              autoCapitalize="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Paste the value"
              /*
               * Mono only while revealed — the canvas's reason is the whole point of the
               * reveal: "so l and 1 are tellable apart". Masked text has no glyphs to tell
               * apart, and the proportional face is the better match for the rest of the card.
               */
              className={cn(FIELD, { 'font-mono': revealed })}
              /*
               * Locked, not merely un-submittable: while the value is in flight nothing in
               * the card moves. The field is also empty by then — `submit` cleared it — so
               * unlike the canvas there are no dots to draw here. Keeping the value to draw
               * them would mean keeping the secret.
               */
              disabled={isSubmitting}
              onChange={(event) => setValue(event.target.value)}
              onKeyDown={onFieldKeyDown}
            />

            <button
              type="button"
              aria-label={revealed ? 'Hide key' : 'Show key'}
              disabled={isSubmitting}
              onClick={() => setRevealed((on) => !on)}
              className={cn(ICON_BUTTON, 'absolute right-1.5 size-7 rounded-[10px]')}
            >
              {revealed ? (
                <EyeSlashIcon className="size-4 stroke-[1.4px]" />
              ) : (
                <EyeIcon className="size-4 stroke-[1.4px]" />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/*
           * The footer's status line swaps while revealed, exactly as §1c draws it: the
           * transcript promise is the standing fact, and the caption is what is true only
           * for as long as the value is on screen.
           */}
          {revealed ? (
            <p className="flex min-w-0 flex-1 items-center gap-1.5 text-label-sm text-tertiary">
              <ShieldCheckIcon className="size-4 shrink-0 text-success" />
              Visible only to you, on this screen
            </p>
          ) : (
            <p className="flex min-w-0 flex-1 items-center gap-1.5 text-label-sm text-success">
              <CheckCircleFilledIcon className="size-4 shrink-0" />
              Never printed in the transcript
            </p>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={skip}
            disabled={isSubmitting}
            className="text-secondary"
          >
            Not now
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={!canSubmit}
            onClick={submit}
          >
            {isSubmitting && <Spinner />}
            Submit key
          </Button>
        </div>
      </div>
    </section>
  )
}

/**
 * §1d, "Behind the (?)": what the card does with a value, where the key comes from, and the
 * rules it holds itself to.
 *
 * A dialog rather than the canvas's floating panel because `@repo/ui` ships no popover —
 * `components/base` has `dialog`, `dropdown-menu`, `sheet` and `tooltip` and nothing
 * anchored — and three sections of prose is more than a tooltip should hold.
 */
const HelpPanel: FC<{ label: string; envVar: string; help?: string }> = ({
  label,
  envVar,
  help,
}) => {
  const provider = providerOf(label)

  return (
    <DialogContent className="max-h-[85vh] max-w-[520px] gap-3 overflow-y-auto rounded-2xl border-primary bg-surface p-4">
      <DialogHeader className="items-start pt-0 pr-0">
        <div className="flex min-w-0 flex-col gap-1">
          <DialogTitle className="text-label-md font-medium text-primary">
            What happens to a key you paste here
          </DialogTitle>
          {/* The variable this whole panel is about, which is also its accessible description. */}
          <DialogDescription className="font-mono text-label-xs text-tertiary">
            {envVar}
          </DialogDescription>
        </div>
        <DialogCloseButton />
      </DialogHeader>

      <div className="flex flex-col gap-2.5">
        {FATE.map((line) => (
          <p key={line} className="flex gap-2 text-label-sm text-secondary">
            <ShieldCheckIcon className="mt-px size-3.5 shrink-0 text-success" />
            {line}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1.5">
        {/*
         * The canvas draws this heading as a link, in link blue with an external-link glyph.
         * There is no URL to put behind it: `secret.request` carries `prompt` and a
         * `metadata` bag whose only human field is `help`, and Hermes keeps no directory of
         * providers. So it is a heading, and the honest answer sits under it.
         */}
        <h3 className="text-label-md font-medium text-primary">
          {provider ? `Where to get a ${provider} key` : 'Where to get this key'}
        </h3>
        <p className="text-label-sm text-secondary">
          {/*
           * `help` is the skill author's own words, off the request's metadata. Rendered as
           * text and never linkified even when it contains a URL — nothing vets a skill's
           * metadata, and a clickable link next to a credential field is a phishing surface.
           */}
          {help ??
            `${provider ? `${provider}’s` : 'The provider’s'} own documentation is where this key comes from. The request carried no link, and nothing here keeps a directory of providers.`}
        </p>
      </div>

      <div className="flex flex-col gap-2.5 pt-1">
        <p className="text-label-sm text-tertiary">Rules this card follows</p>
        {RULES.map(({ rule, detail }) => (
          <p key={rule} className="text-label-md text-secondary">
            <span className="text-primary">{rule}</span> {detail}
          </p>
        ))}
      </div>
    </DialogContent>
  )
}
