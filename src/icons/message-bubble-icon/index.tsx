import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MessageBubbleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="14" height="14" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M4.694 11.718A5.25 5.25 0 1 0 2.63 9.91m2.068 1.807h-.004l-2.944.533.88-2.34m0 0v-.002m1.947-4.12h4.846M4.577 8.212h3.23"
    />
  </svg>
);
