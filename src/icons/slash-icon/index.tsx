import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SlashIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="m11.625 2.25-5.25 13.5"
    />
  </svg>
);
