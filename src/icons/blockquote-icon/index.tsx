import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const BlockquoteIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    className={className}
  >
    <path
      d="M0.75 0.75V11.4167M2.80128 6.08333H11.4167M2.80128 2.68939H8.13462M2.80128 9.47727H8.13462"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
