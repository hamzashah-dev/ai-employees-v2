import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const HandIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeMiterlimit="10"
      strokeWidth="currentStroke"
      d="M8.521 7.95V3.33c0-.6.48-1.08 1.08-1.08s1.08.48 1.08 1.08v4.62m-2.16 0V3.99c0-.6-.48-1.08-1.08-1.08s-1.08.48-1.08 1.08v6.66l-1.68-.96c-.48-.18-1.08-.06-1.44.36s-.3 1.08.06 1.5l2.28 2.58a4.82 4.82 0 0 0 3.6 1.62h2.22A3.61 3.61 0 0 0 15 12.15V5.37c0-.6-.48-1.08-1.08-1.08s-1.08.48-1.08 1.08v2.58-3.96c0-.6-.48-1.08-1.08-1.08s-1.08.48-1.08 1.08v3.96"
    />
  </svg>
);
