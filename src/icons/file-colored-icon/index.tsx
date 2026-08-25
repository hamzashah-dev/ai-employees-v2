import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const FileColoredIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="30"
      height="30"
      fill="none"
      viewBox="0 0 30 30"
      className={className}
    >
      <g clipPath="url(#file-colored-icon)">
        <path
          fill="#248eff"
          d="M0 7.5A7.5 7.5 0 0 1 7.5 0h15A7.5 7.5 0 0 1 30 7.5v15a7.5 7.5 0 0 1-7.5 7.5h-15A7.5 7.5 0 0 1 0 22.5z"
        />
        <path
          fill="#fff"
          d="M7.708 7.5h3.765a1 1 0 0 1 .692.279l2.545 2.442a1 1 0 0 0 .692.279h6.89c.552 0 1.082.21 1.473.586.39.375.61.884.61 1.414v8c0 .53-.22 1.04-.61 1.414-.39.375-.92.586-1.473.586H7.708c-.552 0-1.082-.21-1.473-.586a1.96 1.96 0 0 1-.61-1.414v-11c0-.53.22-1.04.61-1.414.39-.375.92-.586 1.473-.586"
        />
      </g>
      <defs>
        <clipPath id="file-colored-icon">
          <rect width="30" height="30" fill="#fff" rx="4" />
        </clipPath>
      </defs>
    </svg>
  );
};
