import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const EyeOpenIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.038 8.208a.6.6 0 0 1 0-.418 6.45 6.45 0 0 1 11.925 0 .6.6 0 0 1 0 .418 6.45 6.45 0 0 1-11.925 0"
    />
    <path
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8 9.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6"
    />
  </svg>
);
