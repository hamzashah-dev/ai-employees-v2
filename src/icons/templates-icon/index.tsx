import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const TemplatesIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="13"
    height="13"
    viewBox="0 0 13 13"
    fill="none"
    className={className}
  >
    <path
      d="M4.30557 11.4166L4.30557 0.75M11.4167 4.30557H0.75M11.4167 10.5278V1.63889C11.4167 1.14797 11.0187 0.75 10.5278 0.75H1.63889C1.14797 0.75 0.75 1.14797 0.75 1.63889V10.5278C0.75 11.0187 1.14796 11.4167 1.63889 11.4167H10.5278C11.0187 11.4167 11.4167 11.0187 11.4167 10.5278Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
