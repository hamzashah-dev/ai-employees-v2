import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TableHeaderIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M11.333 5.999H4.667m8.41-2.667H2.923A.928.928 0 0 0 2 4.265v7.467c0 .516.413.933.923.933h10.154c.51 0 .923-.417.923-.933V4.265a.928.928 0 0 0-.923-.933Z"
      />
    </svg>
  );
};
