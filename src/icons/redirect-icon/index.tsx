import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const RedirectIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="4"
      d="M11.5 29V3"
      opacity=".3"
    />
    <path
      stroke="#08F"
      strokeLinecap="round"
      strokeWidth="4"
      d="M11.5 29v-3.667c0-6.075 4.925-11 11-11h6.669m-4.036 5.334 4.23-4.705c.627-.629.627-.629 0-1.257L25.134 9"
    />
  </svg>
);
