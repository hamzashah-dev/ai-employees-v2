import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CheckCircleFilledIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M1.688 9a7.312 7.312 0 1 1 14.624 0A7.312 7.312 0 0 1 1.687 9Zm10.02-1.36a.562.562 0 1 0-.915-.654l-2.427 3.397-1.218-1.218a.563.563 0 0 0-.795.795l1.687 1.688a.562.562 0 0 0 .855-.071l2.813-3.938Z"
      fill="currentColor"
    />
  </svg>
);
