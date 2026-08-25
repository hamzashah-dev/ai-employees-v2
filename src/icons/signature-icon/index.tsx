import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SignatureIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    strokeWidth="1"
    className={className}
  >
    <path
      d="M2.8 11.2c1.6-.5 2.7-2 3.3-4.6.5-2.2.4-3.5-.3-3.9-.5-.3-.9 0-1 .9-.2 1.9.5 4.2 1.7 6 .9 1.4 1.9 2.1 2.8 1.9.8-.2 1.3-.8 1.6-1.9.2-.7.5-1 .9-1s.6.3.7.9c.1.6.5.9 1.1.9h.4M2 13.8h12"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
