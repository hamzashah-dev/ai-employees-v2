import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BulbIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.86671 10.7V12.2C9.86671 12.7591 9.86671 13.0387 9.77198 13.2592C9.64568 13.5533 9.40341 13.7869 9.09849 13.9087C8.8698 14 8.57988 14 8.00004 14C7.4202 14 7.13028 14 6.90159 13.9087C6.59667 13.7869 6.35441 13.5533 6.2281 13.2592C6.13337 13.0387 6.13337 12.7591 6.13337 12.2V10.7M9.86671 10.7C11.5149 10.0056 12.6667 8.34529 12.6667 6.5C12.6667 4.01472 10.5774 2 8.00004 2C5.42271 2 3.33337 4.01472 3.33337 6.5C3.33337 8.34529 4.4852 10.0056 6.13337 10.7M9.86671 10.7H6.13337"
    />
  </svg>
);
