import type { CSSProperties, FC } from 'react'
import { cn } from '@repo/ui/cn'
import { useBotScene } from '../../hooks/use-bot-scene'
import type { BotColorValue, BotEyeStyle, BotShape } from '../../types'
import { BotGlyph } from '../bot-glyph'

/**
 * The WebGL half of `BotAvatar`, and the only module in this folder that reaches `three`.
 *
 * Kept behind `BotAvatar`'s lazy boundary rather than exported for direct use: importing this
 * file is what pulls the renderer into a chunk, so a caller reaching past the wrapper would
 * quietly undo the code-splitting the wrapper exists for.
 */
interface BotAvatarCanvasProps {
  shape: BotShape
  eyeStyle: BotEyeStyle
  color: BotColorValue
  label: string
  interactive: boolean
  className?: string
  style?: CSSProperties
}

export const BotAvatarCanvas: FC<BotAvatarCanvasProps> = ({
  shape,
  eyeStyle,
  color,
  label,
  interactive,
  className,
  style,
}) => {
  const { containerRef, isSupported } = useBotScene({ shape, eyeStyle, color, interactive })

  if (!isSupported) {
    return (
      <BotGlyph
        shape={shape}
        eyeStyle={eyeStyle}
        color={color}
        label={label}
        className={className}
        style={style}
      />
    )
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={label}
      // The canvas inside is `aria-hidden` and carries no text, so the accessible name has to
      // live here — the same contract `EmployeeAvatar` and `AgentBlob` give their `<svg>`.
      className={cn('block shrink-0 overflow-hidden', { 'touch-none': interactive }, className)}
      style={style}
    />
  )
}
