import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ClipboardIcon: FC<PropsWithClassName> = ({ className }) => (
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
      strokeWidth="currentWidth"
      d="M10.121 9.154H5.88m4.433-6.23h1.506c.469 0 .849.412.849.922v9.23c0 .51-.38.924-.849.924H4.182c-.469 0-.849-.413-.849-.923v-9.23c0-.51.38-.924.849-.924h1.506m3.585 1.385H6.727c-.585 0-1.06-.517-1.06-1.154S6.142 2 6.727 2h2.546c.586 0 1.06.517 1.06 1.154s-.474 1.154-1.06 1.154"
    />
  </svg>
);
