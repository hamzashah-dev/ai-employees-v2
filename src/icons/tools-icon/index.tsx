import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ToolsIcon: FC<PropsWithClassName> = ({ className }) => {
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
        strokeWidth="1"
        d="m12.25 9.25-1 1m-4.499-6.5-1 1m1.98 5.98 3.27 3.27L14 11l-3.267-3.268-3.001 2.999Zm.522-5.478L5 2l-3 3 3.244 3.243 3.008-2.991Zm-3.255 8.21L2 14l.5-3.026 8.726-8.68a1 1 0 0 1 1.419 0l1.06 1.056a.994.994 0 0 1 0 1.413l-8.707 8.7Z"
      />
    </svg>
  );
};
