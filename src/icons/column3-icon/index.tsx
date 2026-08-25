import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const Column3Icon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M3 6.5C3 5.67157 3.67157 5 4.5 5H5.5C6.32843 5 7 5.67157 7 6.5V17.5C7 18.3284 6.32843 19 5.5 19H4.5C3.67157 19 3 18.3284 3 17.5V6.5Z"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="1.5"
    />
    <path
      d="M17 6.5C17 5.67157 17.6716 5 18.5 5H19.5C20.3284 5 21 5.67157 21 6.5V17.5C21 18.3284 20.3284 19 19.5 19H18.5C17.6716 19 17 18.3284 17 17.5V6.5Z"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="1.5"
    />
    <path
      d="M10 6.5C10 5.67157 10.6716 5 11.5 5H12.5C13.3284 5 14 5.67157 14 6.5V17.5C14 18.3284 13.3284 19 12.5 19H11.5C10.6716 19 10 18.3284 10 17.5V6.5Z"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="1.5"
    />
  </svg>
);
