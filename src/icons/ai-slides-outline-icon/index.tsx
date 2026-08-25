import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AISlidesOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="16" height="16" fill="none" className={className}>
    <path
      stroke="currentColor"
      d="M2 10.167h12m-10.667 2.5h9.334c.736 0 1.333-.597 1.333-1.334V4.667c0-.737-.597-1.334-1.333-1.334H3.333C2.597 3.333 2 3.93 2 4.667v6.666c0 .737.597 1.334 1.333 1.334Z"
    />
  </svg>
);
