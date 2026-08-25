import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BrainstormPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="29"
    height="29"
    viewBox="0 0 29 29"
    fill="none"
    className={className}
  >
    <path
      d="M12.167 14.085a4.675 4.675 0 0 1 4.666 0M10.8 11.328a4.667 4.667 0 1 1-6.6 6.6 4.667 4.667 0 0 1 6.6-6.6Zm14 0a4.667 4.667 0 1 1-6.6 6.6 4.667 4.667 0 0 1 6.6-6.6Z"
      stroke="#9841F5"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
