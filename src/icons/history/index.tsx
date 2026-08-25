import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const HistoryIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M9 5.36538V9H11.5962M2.76733 6.40385C3.78457 3.96456 6.19207 2.25 9.00002 2.25C12.728 2.25 15.75 5.27208 15.75 9.00001C15.75 12.728 12.728 15.75 9.00002 15.75C5.80822 15.75 3.13383 13.5347 2.43063 10.5577M2.25 3.80769V6.40385H4.84616"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
