import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MusicPlaceholderIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg viewBox="0 0 32 32" fill="none" className={className}>
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M25.178 4.079a2.23 2.23 0 0 1 1.95.387 2.25 2.25 0 0 1 .874 1.771v13.172a4.331 4.331 0 1 1-2.77-4.042v-3.86l-12.567 3.49v8.682a4.331 4.331 0 1 1-2.77-4.051v-9.551c.003-.487.163-.963.46-1.353.295-.389.71-.672 1.184-.803l13.629-3.84z"
      clipRule="evenodd"
    />
  </svg>
);
