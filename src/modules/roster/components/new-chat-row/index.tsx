import type { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon } from '@/modules/core/components/icon'

/** Starts a fresh conversation from the home screen. */
export const NewChatRow: FC = () => {
  const navigate = useNavigate()

  return (
    <button
      type="button"
      onClick={() => navigate('/')}
      className="flex h-10 w-full items-center gap-2.5 rounded-[12px] px-2.5 text-left hover:bg-[rgb(var(--color-ink-2))]"
    >
      <PlusIcon className="size-[18px] shrink-0 text-[rgb(var(--color-ink-6))]" />
      <span className="text-label-md font-medium text-[rgb(var(--color-ink-7))]">
        New Chat
      </span>
    </button>
  )
}
