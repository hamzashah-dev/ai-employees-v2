import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TableIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M9.99869 3.33409V16.6673M16.6654 7.7783H3.33203M16.6654 12.2229H3.33203M15.5543 3.33398H4.44314C3.8295 3.33398 3.33203 3.83145 3.33203 4.4451V15.5562C3.33203 16.1699 3.8295 16.6673 4.44314 16.6673H15.5543C16.1679 16.6673 16.6654 16.1699 16.6654 15.5562V4.4451C16.6654 3.83145 16.1679 3.33398 15.5543 3.33398Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
