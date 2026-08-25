import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const HumorizePresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      stroke="#F14646"
      strokeLinecap="round"
      strokeWidth="2.4"
      d="m26.907 10-7.203 5.686a.4.4 0 0 0 0 .628L26.907 22M5 10l7.202 5.686a.4.4 0 0 1 0 .628L5 22"
    />
  </svg>
);
