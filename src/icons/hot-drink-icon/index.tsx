import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const HotDrinkIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="18" height="18" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M12.79 8.826h.49a1.952 1.952 0 0 1 0 3.904h-.49M5.09 3.518a.896.896 0 0 0 0 1.267m5.644-1.267a.896.896 0 0 0 0 1.267M7.912 2.25c.35.35.35.918 0 1.268a.896.896 0 0 0 0 1.267m.755 10.965H6.893a4.124 4.124 0 0 1-4.123-4.124V9.02A2.03 2.03 0 0 1 4.8 6.99h5.96c1.121 0 2.03.909 2.03 2.03v2.607a4.124 4.124 0 0 1-4.123 4.124"
    />
  </svg>
);
