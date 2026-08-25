import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PhoneIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M18.333 14.1v2.5a1.667 1.667 0 0 1-1.816 1.667 16.492 16.492 0 0 1-7.192-2.559 16.252 16.252 0 0 1-5-5 16.492 16.492 0 0 1-2.558-7.225 1.666 1.666 0 0 1 1.658-1.816h2.5A1.667 1.667 0 0 1 7.592 3.1c.105.8.3 1.586.583 2.342A1.667 1.667 0 0 1 7.8 7.2L6.742 8.258a13.334 13.334 0 0 0 5 5L12.8 12.2a1.667 1.667 0 0 1 1.758-.375c.756.282 1.542.478 2.342.583a1.666 1.666 0 0 1 1.433 1.692Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
