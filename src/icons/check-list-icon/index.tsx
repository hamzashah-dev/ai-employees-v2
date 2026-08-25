import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CheckListIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="24"
      height="24"
      fill="none"
      viewBox="0 0 24 24"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M9.118 3 4.739 7.154 2.936 5.492m6.182 4.431-4.379 4.154-1.803-1.662m6.182 4.431L4.739 21l-1.803-1.662M12.21 5.77h7.727M12.21 12h7.727m-7.727 6.23h7.727"
      />
    </svg>
  );
};
