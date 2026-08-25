import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';


export const CheckRectangleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M5.69401 8.0002L7.23391 9.5394L10.3124 6.46094M5.19201 2H10.8152C12.7806 2 14.0039 3.38746 14.0039 5.35092V10.6491C14.0039 12.6125 12.7806 14 10.8145 14H5.19201C3.22661 14 2.00391 12.6125 2.00391 10.6491V5.35092C2.00391 3.38746 3.23245 2 5.19201 2Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
