import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CursorIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m12.032 4.912-9.63-3.138a.497.497 0 0 0-.621.645l3.562 9.63a.309.309 0 0 0 .584-.014l1.35-4.237a.88.88 0 0 1 .505-.548l4.272-1.746a.315.315 0 0 0-.022-.592"
    />
  </svg>
);
