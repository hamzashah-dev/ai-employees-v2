import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ThumbsDownIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m11.297 2.667-2.54-.627A1.368 1.368 0 0 0 8.43 2H5.715c-.25 0-.497.069-.71.2a1.34 1.34 0 0 0-.498.537L2.142 7.404a1.319 1.319 0 0 0 .06 1.297c.12.193.29.353.491.464.201.11.428.168.658.168H7.92m3.377-6.666v6l-2.29 3.392c-.269.396-.411.862-.411 1.338a.607.607 0 0 1-.612.603H7.92a1.36 1.36 0 0 1-.956-.39 1.325 1.325 0 0 1-.395-.943V9.333m4.728-6.666h1.352c.358 0 .702.14.955.39.254.25.396.59.396.943v4c0 .354-.142.693-.396.943a1.36 1.36 0 0 1-.955.39H10.96"
    />
  </svg>
);
