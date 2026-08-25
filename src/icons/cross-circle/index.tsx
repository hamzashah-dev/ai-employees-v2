import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CrossCircleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 22 22"
    fill="none"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M11 2.063A8.937 8.937 0 0 0 2.062 11 8.937 8.937 0 0 0 11 19.938 8.937 8.937 0 0 0 19.938 11 8.937 8.937 0 0 0 11 2.062ZM9.423 8.451a.687.687 0 1 0-.971.971L10.028 11l-1.576 1.577a.687.687 0 1 0 .971.971L11 11.972l1.577 1.576a.685.685 0 0 0 .989.018.688.688 0 0 0-.018-.99L11.972 11l1.576-1.577a.686.686 0 0 0-.21-1.14.687.687 0 0 0-.761.169L11 10.028 9.423 8.452Z"
      fill="currentColor"
    />
  </svg>
);
