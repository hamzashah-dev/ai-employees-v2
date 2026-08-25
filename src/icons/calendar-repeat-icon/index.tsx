import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CalendarRepeatIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M13.0337 2.5V4.96812M6.97328 2.5V4.96812M12.1917 12.3024C11.7244 13.1113 10.8497 13.6535 9.84926 13.6535C8.35718 13.6535 7.43986 12.1523 7.43986 12.1523M7.49968 9.60408C7.96601 8.78708 8.84176 8.24483 9.85026 8.24483C11.6596 8.24483 12.5597 9.74592 12.5597 9.74592M12.5591 8.06885V9.73492H10.892M9.10684 12.1452H7.43986V13.6957M13.1784 3.68449H6.82812C4.62514 3.68449 3.25 4.91125 3.25 7.16612V13.9542C3.25 16.2448 4.62514 17.4999 6.82812 17.4999H13.1719C15.3814 17.4999 16.75 16.2667 16.75 14.011V7.16612C16.7565 4.91125 15.3878 3.68449 13.1784 3.68449Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
