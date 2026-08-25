import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AllPagesIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M11.86 2.55208V4.96259C11.8593 6.13864 12.7956 7.09409 13.9529 7.09652H16.1974M11.4635 2.50003C11.9206 2.50003 12.3584 2.689 12.6751 3.02479L15.7817 6.31612C16.0824 6.63406 16.2499 7.05826 16.2499 7.49947V14.3027C16.2619 16.0166 14.9363 17.4303 13.2533 17.5L6.75849 17.4992C5.05962 17.4611 3.71327 16.0303 3.75076 14.3027V5.54722C3.79064 3.84803 5.16012 2.49273 6.83188 2.50003H11.4635Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
