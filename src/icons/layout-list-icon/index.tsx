import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LayoutListIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.333"
      d="M5.445 3.257h6.222M5.445 7h6.222m-6.222 3.743h6.222M2.723 3.597c.215 0 .389-.152.389-.34s-.174-.34-.39-.34c-.214 0-.388.152-.388.34s.174.34.389.34m0 3.743c.215 0 .389-.152.389-.34s-.174-.34-.39-.34c-.214 0-.388.152-.388.34s.174.34.389.34m0 3.743c.215 0 .389-.152.389-.34s-.174-.34-.39-.34c-.214 0-.388.152-.388.34s.174.34.389.34"
    />
  </svg>
);
