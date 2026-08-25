import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const SendIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M10.6154 13.3846L3 9.92308L21 3L14.0769 21L10.6154 13.3846ZM10.6154 13.3846L14.7692 9.23077"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
