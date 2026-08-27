import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { useBrowserView } from '../../hooks/use-browser-view'
import { BrowserFrame } from '../browser-frame'
import { LoginRequest } from '../login-request'

interface ScreenPreviewProps extends PropsWithClassName {
  profile: string
  /** True while the drawer is maximized over the conversation. */
  isExpanded?: boolean
  /** Maximizes the drawer over the conversation, and restores it. */
  onToggleExpand?: () => void
}

/**
 * What we can show of the employee's screen, and what we cannot.
 *
 * This used to be a static drawing with a comment saying there was no stream to
 * show. Half of that is still true — see `useBrowserView` for why `liveUrl` is
 * `null` today — so the drawing survives as `BrowserFrame`'s empty state rather
 * than being deleted. What is new is that the two things the app *does* know are
 * now rendered: whether the agent is driving a browser this turn, and whether it
 * has stopped to ask a human for something.
 *
 * A fragment rather than a wrapper: the panel's body is already a
 * `flex flex-col gap-2` column, so both children sit in it directly and
 * `className` keeps meaning exactly what it did — the frame's height. Wrapping
 * them would put a second flex context between the two and buy nothing.
 *
 * The request goes *above* the frame: it is the thing that has stopped, and the
 * frame beneath it is where you would do something about it.
 */
export const ScreenPreview: FC<ScreenPreviewProps> = ({
  profile,
  className,
  isExpanded,
  onToggleExpand,
}) => {
  const { liveUrl, agentBrowsing, clarify, answer } = useBrowserView(profile)

  return (
    <>
      {clarify && <LoginRequest request={clarify} onAnswer={answer} />}
      <BrowserFrame
        liveUrl={liveUrl}
        agentBrowsing={agentBrowsing}
        className={className}
        isExpanded={isExpanded}
        onToggleExpand={onToggleExpand}
      />
    </>
  )
}
