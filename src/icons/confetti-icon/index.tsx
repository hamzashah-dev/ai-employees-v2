import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ConfettiIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeLinejoin="round"
      strokeWidth="3"
      d="M25.139 16.24a3.803 3.803 0 0 0-2.696-.388m-1.132-4.458c.523-.788.74-1.74.61-2.677M16.682 4a8.714 8.714 0 0 1-.24 6.055M7.005 27.871l12.332-4.597a2.308 2.308 0 0 0 .886-3.785l-7.735-7.735a2.327 2.327 0 0 0-3.804.978L4.106 25.064a2.253 2.253 0 0 0 2.899 2.807ZM27.077 10a.923.923 0 1 1 0-1.846.923.923 0 0 1 0 1.846Z"
    />
  </svg>
);
