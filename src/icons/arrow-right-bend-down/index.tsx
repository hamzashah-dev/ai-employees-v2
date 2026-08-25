import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ArrowRightBendDownIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m13.179 14.373 3.581-3.582L13.18 7.21"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M1.24 3.628v2.388a4.776 4.776 0 0 0 4.776 4.775H16.76"
    />
  </svg>
);
