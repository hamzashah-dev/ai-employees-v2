import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AudioWaveIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M3 9.923v4.154m4.5-7.615v11.077M12 3v18m4.5-14.538v11.077M21 9.923v4.154"
      />
    </svg>
  );
};
