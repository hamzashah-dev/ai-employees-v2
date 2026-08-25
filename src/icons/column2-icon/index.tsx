import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const Column2Icon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M3 7C3 5.89543 3.89543 5 5 5H8C9.10457 5 10 5.89543 10 7V17C10 18.1046 9.10457 19 8 19H5C3.89543 19 3 18.1046 3 17V7Z"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="1.5"
    />
    <path
      d="M14 7C14 5.89543 14.8954 5 16 5H19C20.1046 5 21 5.89543 21 7V17C21 18.1046 20.1046 19 19 19H16C14.8954 19 14 18.1046 14 17V7Z"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="1.5"
    />
  </svg>
);
