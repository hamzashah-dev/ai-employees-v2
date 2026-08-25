import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const GlobeSparkleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7.492 14C4.413 13.75 2 11.163 2 8.006 2 4.694 4.674 2 7.977 2c3.054 0 5.567 2.3 5.928 5.269m-3.845-1.35C9.75 3.63 8.934 2 7.976 2c-.951 0-1.772 1.631-2.083 3.919-.094.65-.143 1.35-.143 2.087s.05 1.444.143 2.094c.218 1.587.89 3.119 1.598 3.9M2 8.01h8.06m2.217 1.875.067.183c.253.687.792 1.23 1.475 1.484l.181.067-.181.068a2.5 2.5 0 0 0-1.475 1.484l-.067.182-.067-.182a2.5 2.5 0 0 0-1.475-1.484l-.181-.068.181-.067a2.5 2.5 0 0 0 1.475-1.485z"
    />
  </svg>
);
