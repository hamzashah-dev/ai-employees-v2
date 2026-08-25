import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const GlobeIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M12 21a9 9 0 0 0 9-9m-9 9a9 9 0 0 1-9-9m9 9a15.54 15.54 0 0 0 3.461-9A15.54 15.54 0 0 0 12 3m0 18a15.54 15.54 0 0 1-3.462-9A15.54 15.54 0 0 1 12 3m9 9a9 9 0 0 0-9-9m9 9H3m9-9a9 9 0 0 0-9 9"
    />
  </svg>
);
