import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const PieChartIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M9.84288 5.47581C5.49184 6.00315 2.24704 10.1168 3.15091 14.7724C3.7415 17.8099 6.18944 20.2579 9.227 20.8475C13.8825 21.7523 17.9962 18.5075 18.5235 14.1565C18.5838 13.6544 18.1879 13.2098 17.6819 13.2098H11.6311C11.1661 13.2098 10.7895 12.8333 10.7895 12.3672V6.31741C10.7895 5.81148 10.3449 5.41549 9.84288 5.47581Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M20.9928 9.25939C20.5656 6.00876 17.9912 3.43433 14.7406 3.00721C14.2356 2.94104 13.7842 3.33898 13.7842 3.84784V9.37517C13.7842 9.83927 14.1607 10.2158 14.6258 10.2158H20.1521C20.662 10.2158 21.0589 9.76533 20.9928 9.25939Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
