import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PlayFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.334 3c-.397 0-.786.099-1.133.286a2.184 2.184 0 0 0-.862.77A2.115 2.115 0 0 0 5 5.166V18.834c.007.394.124.777.339 1.11.211.328.51.594.862.77a2.378 2.378 0 0 0 2.305-.023l11.306-6.83c.351-.174.647-.437.856-.763a2.077 2.077 0 0 0 0-2.248 2.145 2.145 0 0 0-.857-.762L8.504 3.308A2.377 2.377 0 0 0 7.334 3Z"
      clipRule="evenodd"
    />
  </svg>
);
