import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingCalendarIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 12 14" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M.656 5.042H11.22M8.567 7.385h.006m-2.635 0h.005m-2.64 0h.005m5.26 2.332h.005m-2.635 0h.005m-2.64 0h.005M8.331.6v1.974M3.544.6v1.974m4.902-1.027H3.43c-1.74 0-2.827.982-2.827 2.786v5.43c0 1.832 1.087 2.837 2.827 2.837h5.01c1.746 0 2.827-.988 2.827-2.792V4.333c.006-1.804-1.076-2.786-2.822-2.786"
    />
  </svg>
);
