import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StaysIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M8.74844 16.6663V11.9213M9.99688 8.7219H10.0031M9.99688 5.83301H10.0031M11.2453 11.9213V16.6663M11.8695 12.333C11.3293 11.8642 10.6722 11.6108 9.99688 11.6108C9.32157 11.6108 8.66447 11.8642 8.12422 12.333M12.4938 8.7219H12.5M12.4938 5.83301H12.5M7.5 8.7219H7.50624M7.5 5.83301H7.50624"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.75 3.33301H6.25C5.55964 3.33301 5 3.92996 5 4.66634V15.333C5 16.0694 5.55964 16.6663 6.25 16.6663H13.75C14.4404 16.6663 15 16.0694 15 15.333V4.66634C15 3.92996 14.4404 3.33301 13.75 3.33301Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
