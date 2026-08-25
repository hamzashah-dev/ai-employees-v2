import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PresentationIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M2.5 12.7077H17.5M4.16667 15.8327H15.8333C16.7538 15.8327 17.5 15.0865 17.5 14.166V5.83268C17.5 4.91221 16.7538 4.16602 15.8333 4.16602H4.16667C3.24619 4.16602 2.5 4.91221 2.5 5.83268V14.166C2.5 15.0865 3.24619 15.8327 4.16667 15.8327Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
