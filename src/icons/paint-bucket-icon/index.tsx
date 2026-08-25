import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PaintBucketIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M4.37268 2.25L7.71895 5.625M2.36492 9.675H12.4037M13.7422 8.325L8.38821 2.925L2.63262 8.73C2.38737 8.98235 2.25 9.32163 2.25 9.675C2.25 10.0284 2.38737 10.3676 2.63262 10.62L6.11274 14.13C6.64815 14.67 7.45125 14.67 7.98665 14.13L13.7422 8.325ZM15.75 14.4C15.75 14.758 15.609 15.1014 15.358 15.3546C15.1069 15.6078 14.7665 15.75 14.4115 15.75C14.0565 15.75 13.716 15.6078 13.465 15.3546C13.214 15.1014 13.073 14.758 13.073 14.4C13.073 13.32 14.2107 12.78 14.4115 11.7C14.6123 12.78 15.75 13.32 15.75 14.4Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
