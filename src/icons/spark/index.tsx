import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SparkIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeWidth="currentStroke"
      d="M10.023 2.25v5.192h4.602L7.977 15.75v-5.192H3.375z"
    />
  </svg>
);
