import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIChatOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="16" height="16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      d="M14 8a6 6 0 1 0-11.207 2.984c-.263.689-.512 1.49-.673 2.29a.492.492 0 0 0 .601.58c.766-.18 1.545-.431 2.229-.686A6 6 0 0 0 14 8Z"
    />
  </svg>
);
