import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CodeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M6.28617 13.9769L2.5 9.99968L6.28617 6.0224M13.7138 13.9769L17.5 9.99968L13.7138 6.0224M7.88477 16.6663L12.1157 3.33301"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
