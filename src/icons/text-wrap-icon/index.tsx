import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TextWrapIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeWidth="currentStroke"
      d="M2.25 3.375v4.602c0 2.26 1.86 4.091 4.154 4.091h9.346m0 0-2.596 2.557m2.596-2.557-2.596-2.557m-7.27-6.136h9.866m-9.865 3.58h5.711"
    />
  </svg>
);
