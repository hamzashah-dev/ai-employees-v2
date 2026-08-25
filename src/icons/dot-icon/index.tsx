import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DotIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="2" height="2" viewBox="0 0 2 2" fill="none" className={className}>
    <path
      d="M.994 1.991a.965.965 0 0 1-.7-.288A.962.962 0 0 1 0 .997.94.94 0 0 1 .293.301.957.957 0 0 1 .994.008c.272 0 .506.098.701.293a.94.94 0 0 1 .294.696c0 .182-.047.35-.14.502-.09.15-.208.269-.358.358a.948.948 0 0 1-.497.134Z"
      fill="currentColor"
    />
  </svg>
);
