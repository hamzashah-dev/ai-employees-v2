import type { FC } from 'react'

interface AudioWaveformProps {
  /** Seconds elapsed, rendered as m:ss beside the bars. */
  time: number
  /** Microphone levels, 0–1, oldest first. */
  levels: number[]
}

/** The bar strip is fixed-width; a short recording is padded with silence. */
const BAR_COUNT = 64

/**
 * What the editor is replaced by while dictating — chatly-web's `AudioWaveform`.
 *
 * Upstream draws this with its `LiveMicrophoneWaveform` component, which is not
 * part of the mirrored packages. The bars here are driven by the analyser in
 * `use-speech-to-text`, so they still move with the voice rather than on a
 * timer.
 */
export const AudioWaveform: FC<AudioWaveformProps> = ({ time, levels }) => {
  const bars = [...Array<number>(Math.max(0, BAR_COUNT - levels.length)).fill(0), ...levels]

  return (
    <div className="flex min-h-12 w-full items-center gap-4 tablet:min-h-8">
      <div aria-hidden className="flex h-9 grow items-center gap-px overflow-hidden">
        {bars.map((level, index) => (
          <span
            // Bars are a rolling window with no identity of their own; the index
            // is the only stable key and re-using it is what keeps them still.
            key={index}
            className="w-1 shrink-0 rounded-full bg-fill-inverse"
            style={{ height: `${Math.max(6, level * 100)}%` }}
          />
        ))}
      </div>
      <p role="status" className="min-w-8 shrink-0 text-label-md text-secondary">
        {Math.floor(time / 60)}:{String(time % 60).padStart(2, '0')}
      </p>
    </div>
  )
}
