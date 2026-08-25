import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TextAlignIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path fill="#000" d="M4 12h8z" />
    <path fill="#525252" d="M4 12h8z" />
    <path fill="#000" d="M4 19h12z" />
    <path fill="#525252" d="M4 19h12z" />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M4 12h8m-8 7h12M4 5h16"
    />
  </svg>
);
