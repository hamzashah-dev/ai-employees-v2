import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SunMoonIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeOpacity="currentOpacity"
        strokeWidth="currentStroke"
        d="M5.35 8.518a2.333 2.333 0 1 1 3.3-3.3M6.589 7.28l.102.144a4.375 4.375 0 0 0 5.16 1.453 5.251 5.251 0 0 1-8.559 1.7M1.75 6.867h.583M7 1.617v.584m-3.733.933.408.408M1.75 12.117l10.5-10.5"
      />
    </svg>
  );
};
