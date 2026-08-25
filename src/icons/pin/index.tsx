import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PinIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M6.503 11.466 2.25 15.75m9.599-6.084 3.4-2.194a1.04 1.04 0 0 0 .219-1.602L12.13 2.532a1.04 1.04 0 0 0-1.602.219L8.282 6.11l-4.67 1.04a.624.624 0 0 0-.301 1.04l6.395 6.405a.635.635 0 0 0 1.04-.312l1.103-4.617Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
