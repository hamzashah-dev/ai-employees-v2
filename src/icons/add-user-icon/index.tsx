import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AddUserIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20" fill="none" className={className}>
    <path
      stroke="currentColor"
      d="M14.327 11.154V17.5m-3.173-3.173H17.5m-7.788 2.02H2.5v-.578a5.192 5.192 0 0 1 8.558-3.953M7.692 8.269a2.885 2.885 0 1 0 0-5.769 2.885 2.885 0 0 0 0 5.77Z"
    />
  </svg>
);
