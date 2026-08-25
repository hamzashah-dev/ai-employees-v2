import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BarChartAxisIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M10 6.023c0 1.255-1.033 2.272-2.308 2.272S5.385 7.278 5.385 6.023m4.615 0C10 4.768 8.967 3.75 7.692 3.75S5.385 4.768 5.385 6.023m4.615 0h7.5m-12.115 0H2.5m7.5 7.954c0 1.255 1.033 2.273 2.308 2.273s2.307-1.018 2.307-2.273m-4.615 0c0-1.255 1.033-2.273 2.308-2.273s2.307 1.018 2.307 2.273m-4.615 0H2.5m12.115 0H17.5"
    />
  </svg>
);
