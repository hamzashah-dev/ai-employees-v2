import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const LayoutPanelBottomIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <rect
      x="2.25"
      y="3"
      width="13.5"
      height="12"
      rx="2"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <path
      d="M2.25 11.25h13.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
