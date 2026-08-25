import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ZapIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M8.667 1.332 2 9.332h6l-.667 5.333 6.667-8H8l.667-5.333Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
