import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const H3Icon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M16.0635 20.6433C16.387 21.5588 17.2602 22.2147 18.2865 22.2147H19.858C21.1597 22.2147 22.2151 21.1593 22.2151 19.8576V19.4647C22.2151 18.1629 21.1597 17.1076 19.858 17.1076H19.0722H19.6615C20.8549 17.1076 21.8222 16.1402 21.8222 14.9468C21.8222 13.7535 20.8549 12.7861 19.6615 12.7861L18.483 12.7861C17.4939 12.7861 16.6601 13.4507 16.4035 14.3576"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
