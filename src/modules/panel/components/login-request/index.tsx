import { useId, useState, type FC } from 'react'
import { Button } from '@repo/ui/button'
import { cn } from '@repo/ui/cn'
import type { ClarifyRequest } from '@/modules/core/services/hermes/types'

/**
 * The agent has stopped and is waiting on a person — usually a login.
 *
 * This is the whole point of sharing one browser with the agent: it drives until
 * it hits a password or a 2FA prompt, asks, and parks. The card is what makes
 * the parking visible, and answering is what un-parks it.
 *
 * **No countdown, and no deadline.** The wait is `get_clarify_timeout()`, which
 * defaults to 3600s, is configurable through `agent.clarify_timeout`, and means
 * *never expire* at zero or below — so any clock drawn here would be fiction.
 * `clarify.expire` is the only truthful end-of-wait signal, and it clears the
 * request rather than being rendered.
 *
 * `@repo/ui` ships no input primitive — there is not one `<input>` in the whole
 * package — so the field is hand-rolled against the token layer, the same way
 * `RoutineEditor`'s two fields are, with `buttonVariants`' focus treatment so a
 * field and a button focus alike.
 */
const FIELD =
  'w-full rounded-xl border border-primary bg-fill-elevated px-3 text-label-md text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 placeholder:text-tertiary'

interface LoginRequestProps {
  request: ClarifyRequest
  onAnswer: (text: string) => void
}

export const LoginRequest: FC<LoginRequestProps> = ({ request, onAnswer }) => {
  const [text, setText] = useState('')
  const answerId = useId()

  return (
    <section
      aria-label="The agent is waiting on you"
      className="flex shrink-0 flex-col gap-2 rounded-2xl border border-primary bg-fill-elevated p-3"
    >
      <p className="text-label-sm font-medium text-warning">Waiting on you</p>
      <p className="text-body-sm text-primary">{request.question}</p>
      <p className="text-label-xs text-tertiary">
        The agent has stopped here and will wait until you answer. You and it
        share one browser, so a sign-in you complete yourself counts for both.
      </p>

      {request.choices && request.choices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {request.choices.map((choice) => (
            <Button
              key={choice}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onAnswer(choice)}
            >
              {choice}
            </Button>
          ))}
        </div>
      )}

      <form
        className="flex items-end gap-2"
        onSubmit={(event) => {
          event.preventDefault()
          const answer = text.trim()
          if (!answer) return
          onAnswer(answer)
        }}
      >
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <label htmlFor={answerId} className="text-label-sm font-medium text-secondary">
            Your answer
          </label>
          <input
            id={answerId}
            value={text}
            onChange={(event) => setText(event.target.value)}
            className={cn(FIELD, 'h-10')}
            placeholder="Tell it what to do next"
          />
        </div>
        <Button type="submit" variant="primary" size="sm" disabled={!text.trim()}>
          Send
        </Button>
      </form>
    </section>
  )
}
