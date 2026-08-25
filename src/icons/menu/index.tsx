import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MenuIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M3.336 10h13.333M3.336 5h13.333M3.336 15h13.333"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
