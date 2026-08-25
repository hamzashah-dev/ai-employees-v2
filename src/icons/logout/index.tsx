import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LogoutIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M10.933 5.62V4.94c0-1.485-1.17-2.689-2.613-2.689H4.862C3.42 2.25 2.25 3.454 2.25 4.939v8.122c0 1.485 1.17 2.689 2.612 2.689h3.465c1.44 0 2.605-1.2 2.606-2.68v-.689M15.75 9H7.211m8.539 0-2.076-2.127m2.076 2.127-2.076 2.128"
    />
  </svg>
);
