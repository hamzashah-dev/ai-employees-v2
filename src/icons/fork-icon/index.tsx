import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ForkIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M12 3v3.584m0 0a4.15 4.15 0 0 1-1.604 3.279l-.094.069c-1.83 1.35-3.28 3.182-3.934 5.361-.327 1.092-.599 2.2-.599 2.877V21M12 6.584c0 1.282.592 2.492 1.604 3.279l.31.242M5.77 21 3 18.23M5.77 21l2.768-2.77m7.555-6.431c.464.36.862.789 1.184 1.264M18.231 21v-2.83q0-.318-.036-.632M18.23 21l-2.77-2.77m2.77 2.77L21 18.23"
      />
    </svg>
  );
};
