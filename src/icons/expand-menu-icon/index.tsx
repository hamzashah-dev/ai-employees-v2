import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ExpandMenuIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M11.6654 10.25L8.25797 13.8854C8.11478 14.0382 7.88262 14.0382 7.73943 13.8854L4.33203 10.25M11.6654 5.74997L8.25797 2.11458C8.11478 1.96181 7.88262 1.96181 7.73943 2.11458L4.33203 5.74997"
      />
    </svg>
  );
};
