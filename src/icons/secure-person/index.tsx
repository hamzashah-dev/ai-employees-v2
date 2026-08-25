import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SecurePersonIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="17"
      height="16"
      fill="none"
      viewBox="0 0 17 16"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M7.679 12.513H3.166v-.41a3.692 3.692 0 0 1 4.021-3.678m6.235-.015H9.32a.41.41 0 0 0-.41.41v1.098a3.6 3.6 0 0 0 2.461 3.415 3.6 3.6 0 0 0 2.462-3.415V8.82a.41.41 0 0 0-.41-.41ZM6.858 6.77a2.051 2.051 0 1 0 0-4.104 2.051 2.051 0 0 0 0 4.103Z"
      />
    </svg>
  );
};
