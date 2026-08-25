import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FolderOpenIcon: FC<PropsWithClassName> = ({ className }) => {
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
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="m3.263 12.666 1.741-4.574a.64.64 0 0 1 .591-.404h7.774M3.263 12.667h8.859c.294 0 .578-.1.805-.285.226-.185.38-.441.435-.726l.63-3.242a.61.61 0 0 0-.142-.504.63.63 0 0 0-.481-.22M3.263 12.666a1.27 1.27 0 0 1-.893-.364 1.24 1.24 0 0 1-.37-.88V4.577c0-.33.133-.646.37-.88s.558-.364.893-.364H5.79L7.684 5.2h4.421c.335 0 .657.13.894.364s.37.55.37.88V7.69"
      />
    </svg>
  );
};
