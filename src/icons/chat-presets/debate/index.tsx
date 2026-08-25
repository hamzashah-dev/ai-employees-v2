import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DebatePresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#4693F1"
      d="M14.59 9.818a8.59 8.59 0 1 1-3.824 16.285 1.404 1.404 0 0 0-.987-.115l-1.912.512A1.117 1.117 0 0 1 6.5 25.133l.512-1.912c.088-.33.038-.68-.115-.987A8.59 8.59 0 0 1 14.59 9.818Zm-3.436 7.732a.86.86 0 1 0 0 1.719.86.86 0 0 0 0-1.72Zm3.437 0a.86.86 0 1 0 0 1.719.86.86 0 0 0 0-1.72Zm3.436 0a.86.86 0 1 0 0 1.719.86.86 0 0 0 0-1.72ZM20.318 6a5.727 5.727 0 0 1 5.13 8.277.936.936 0 0 0-.077.658l.34 1.275a.744.744 0 0 1-.91.911l-.99-.265c-.63-4.652-3.494-7.515-8.455-7.993A5.726 5.726 0 0 1 20.318 6Z"
    />
  </svg>
);
