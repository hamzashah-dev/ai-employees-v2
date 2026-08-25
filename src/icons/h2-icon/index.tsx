import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const H2Icon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M1.78613 1.78613V19.0718"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.2148 1.78613V19.0718"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M1.78613 10.4287H11.2147"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M22.2144 22.2147H15.9287V20.8754C15.9287 19.9388 16.4831 19.0912 17.3411 18.7158L20.8386 17.1857C21.6745 16.82 22.2144 15.9943 22.2144 15.0821C22.2144 13.8141 21.1864 12.7861 19.9184 12.7861H18.2859C17.2596 12.7861 16.3864 13.442 16.0628 14.3576"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
