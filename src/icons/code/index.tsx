import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CodeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M8.45833 8.75L10.2083 7L8.45833 5.25M5.54167 5.25L3.79167 7L5.54167 8.75M4.55 12.25H9.45C10.4301 12.25 10.9201 12.25 11.2945 12.0593C11.6238 11.8915 11.8915 11.6238 12.0593 11.2945C12.25 10.9201 12.25 10.4301 12.25 9.45V4.55C12.25 3.56991 12.25 3.07986 12.0593 2.70552C11.8915 2.37623 11.6238 2.10852 11.2945 1.94074C10.9201 1.75 10.4301 1.75 9.45 1.75H4.55C3.56991 1.75 3.07986 1.75 2.70552 1.94074C2.37623 2.10852 2.10852 2.37623 1.94074 2.70552C1.75 3.07986 1.75 3.56991 1.75 4.55V9.45C1.75 10.4301 1.75 10.9201 1.94074 11.2945C2.10852 11.6238 2.37623 11.8915 2.70552 12.0593C3.07986 12.25 3.56991 12.25 4.55 12.25Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeOpacity="currentOpacity"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
