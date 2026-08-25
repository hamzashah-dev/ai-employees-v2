import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ToggleSettingsIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeWidth="1.5"
      d="M9.074 5.1a2.1 2.1 0 0 1-4.2 0m4.2 0a2.1 2.1 0 0 0-4.2 0m4.2 0H15.9m-11.024 0H2.25m6.824 7.349a2.1 2.1 0 0 0 4.2 0m-4.2 0a2.1 2.1 0 1 1 4.2 0m-4.2 0H2.25m11.024 0h2.625"
    />
  </svg>
);
