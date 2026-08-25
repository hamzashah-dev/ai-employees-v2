import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FolderSearchIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      fill="none"
      viewBox="0 0 18 18"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M7.934 13.25H3.671c-.377 0-.738-.15-1.005-.415a1.42 1.42 0 0 1-.416-1.002V4.042c0-.376.15-.736.416-1.002a1.42 1.42 0 0 1 1.005-.415h2.842L8.645 4.75h4.973c.377 0 .739.15 1.005.415.267.266.417.626.417 1.002v1.77M14.47 14.1l1.279 1.275m-4.974-2.833c0 .563.225 1.104.625 1.502a2.135 2.135 0 0 0 3.014 0 2.12 2.12 0 0 0 0-3.005 2.134 2.134 0 0 0-3.639 1.503"
      />
    </svg>
  );
};
