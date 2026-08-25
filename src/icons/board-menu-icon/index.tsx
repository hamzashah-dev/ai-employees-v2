import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BoardMenuIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="34"
    height="34"
    fill="none"
    viewBox="0 0 34 34"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeWidth="2"
      d="M11.025 4.25h11.949c4.176 0 6.776 2.948 6.776 7.12v11.26c0 4.172-2.6 7.12-6.777 7.12H11.025c-4.177 0-6.775-2.948-6.775-7.12V11.37c0-4.172 2.61-7.12 6.775-7.12m5.445 9.059h6.106m-11.15 0h.431m4.613 7.379h6.106m-11.15 0h.431"
    />
  </svg>
);
