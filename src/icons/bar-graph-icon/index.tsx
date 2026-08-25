import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BarGraphIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <g transform="translate(2.833 2.833)">
      <path
        d="M4.5 6.33333H1.5C0.94772 6.33333 0.5 6.8308 0.5 7.44444V12.7222C0.5 13.3359 0.94772 13.8333 1.5 13.8333H4.5C5.05228 13.8333 5.5 13.3359 5.5 12.7222V7.44444C5.5 6.8308 5.05228 6.33333 4.5 6.33333Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.8333 0.5H9.83333C9.28105 0.5 8.83333 0.997467 8.83333 1.61111V12.7222C8.83333 13.3359 9.28105 13.8333 9.83333 13.8333H12.8333C13.3856 13.8333 13.8333 13.3359 13.8333 12.7222V1.61111C13.8333 0.997467 13.3856 0.5 12.8333 0.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
