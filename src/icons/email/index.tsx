import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const EmailIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M11.938 6.134 8.975 8.275a1.683 1.683 0 0 1-1.906 0L4.082 6.134m7.193 7.2c2.028.004 3.394-1.476 3.394-3.296v-4.07c0-1.82-1.366-3.301-3.394-3.301H4.73c-2.028 0-3.394 1.48-3.394 3.3v4.07c0 1.82 1.366 3.301 3.394 3.296h6.545Z"
    />
  </svg>
);
