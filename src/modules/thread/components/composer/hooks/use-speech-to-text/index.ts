import { useCallback, useEffect, useRef, useState } from 'react'
import { transcribeAudio } from '@/modules/core/services/hermes/rest'

/**
 * Dictation for the prompt box, mirroring chatly-web's `use-speech-to-text`.
 *
 * The shape is the same — record with `MediaRecorder`, hand the blob to the
 * backend, drop the returned text into the draft — but the transcript comes
 * from Hermes' own `POST /api/audio/transcribe` rather than chatly's service,
 * and that endpoint takes a base64 data URL rather than multipart.
 *
 * Silence is a *success* with an empty transcript, not an error, so an empty
 * result leaves the draft alone instead of raising anything.
 */

/** How many level samples the waveform keeps. One per animation frame. */
const LEVEL_WINDOW = 64

export interface UseSpeechToTextResult {
  isRecording: boolean
  isProcessing: boolean
  /** Seconds elapsed in the current recording. */
  time: number
  /** Recent microphone levels, 0–1, oldest first. Empty unless recording. */
  levels: number[]
  error?: string
  start: () => void
  stop: () => void
  cancel: () => void
  clearError: () => void
}

interface UseSpeechToTextParams {
  /** Called with the transcript once Hermes returns it. Never called with ''. */
  onTranscript: (text: string) => void
}

function pickMimeType(): string {
  return MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
    ? 'audio/webm;codecs=opus'
    : 'audio/mp4'
}

function readAsDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Could not read the recording'))
    reader.onload = () => resolve(String(reader.result))
    reader.readAsDataURL(blob)
  })
}

export function useSpeechToText({ onTranscript }: UseSpeechToTextParams): UseSpeechToTextResult {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [time, setTime] = useState(0)
  const [levels, setLevels] = useState<number[]>([])
  const [error, setError] = useState<string | undefined>(undefined)

  const recorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const cancelled = useRef(false)
  const ticker = useRef<ReturnType<typeof setInterval> | null>(null)
  const frame = useRef<number | null>(null)
  const audioContext = useRef<AudioContext | null>(null)

  // The latest callback without making `start` depend on it: re-creating the
  // recorder because a parent re-rendered would drop the recording.
  const onTranscriptRef = useRef(onTranscript)
  onTranscriptRef.current = onTranscript

  const teardown = useCallback(() => {
    if (ticker.current) {
      clearInterval(ticker.current)
      ticker.current = null
    }
    if (frame.current !== null) {
      cancelAnimationFrame(frame.current)
      frame.current = null
    }
    void audioContext.current?.close()
    audioContext.current = null
    setLevels([])
    setTime(0)
  }, [])

  useEffect(() => {
    return () => {
      recorder.current?.stream.getTracks().forEach((track) => track.stop())
      teardown()
    }
  }, [teardown])

  /**
   * Drive the waveform off a real analyser rather than a decorative animation:
   * a bar strip that moved while the microphone was muted would be telling the
   * user their voice is being picked up when it is not.
   */
  const watchLevels = useCallback((stream: MediaStream) => {
    if (typeof AudioContext === 'undefined') return

    const context = new AudioContext()
    audioContext.current = context
    const analyser = context.createAnalyser()
    analyser.fftSize = 512
    context.createMediaStreamSource(stream).connect(analyser)

    const samples = new Uint8Array(analyser.frequencyBinCount)
    const read = (): void => {
      analyser.getByteTimeDomainData(samples)
      // Byte time-domain data is centred on 128, so the RMS of the deviation is
      // the loudness. The x4 puts ordinary speech near the top of the bar.
      let sum = 0
      for (const sample of samples) {
        const deviation = (sample - 128) / 128
        sum += deviation * deviation
      }
      const level = Math.min(1, Math.sqrt(sum / samples.length) * 4)
      setLevels((current) => [...current, level].slice(-LEVEL_WINDOW))
      frame.current = requestAnimationFrame(read)
    }
    frame.current = requestAnimationFrame(read)
  }, [])

  const start = useCallback((): void => {
    cancelled.current = false
    setError(undefined)

    if (typeof MediaRecorder === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setError('This browser cannot record audio.')
      return
    }

    void (async () => {
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      } catch {
        setError('Microphone access is blocked. Allow it in the browser to dictate.')
        return
      }

      const media = new MediaRecorder(stream, { mimeType: pickMimeType() })
      recorder.current = media
      chunks.current = []

      media.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.current.push(event.data)
      }

      media.onstop = () => {
        const blob = new Blob(chunks.current, { type: media.mimeType })
        chunks.current = []
        media.stream.getTracks().forEach((track) => track.stop())
        teardown()

        if (cancelled.current) {
          setIsProcessing(false)
          return
        }

        void (async () => {
          try {
            const dataUrl = await readAsDataUrl(blob)
            const text = await transcribeAudio(dataUrl, media.mimeType)
            if (text) onTranscriptRef.current(text)
          } catch (cause) {
            setError(
              cause instanceof Error ? cause.message : 'That recording could not be transcribed.',
            )
          } finally {
            setIsProcessing(false)
          }
        })()
      }

      media.start()
      setIsRecording(true)
      setTime(0)
      ticker.current = setInterval(() => setTime((seconds) => seconds + 1), 1_000)
      watchLevels(stream)
    })()
  }, [teardown, watchLevels])

  const finish = useCallback((wasCancelled: boolean): void => {
    const media = recorder.current
    if (!media || media.state !== 'recording') return
    cancelled.current = wasCancelled
    setIsRecording(false)
    setIsProcessing(!wasCancelled)
    media.stop()
  }, [])

  return {
    isRecording,
    isProcessing,
    time,
    levels,
    error,
    start,
    stop: () => finish(false),
    cancel: () => finish(true),
    clearError: () => setError(undefined),
  }
}
