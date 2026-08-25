import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MessageCircleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="m2 14 1.267-3.8A5.667 5.667 0 1 1 5.8 12.732L2 13.999Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
