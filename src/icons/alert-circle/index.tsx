import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AlertCircleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M10 17.5a7.5 7.5 0 1 0 0-15 7.5 7.5 0 0 0 0 15Zm0-11.652c.444 0 .804.36.804.804v3.482a.804.804 0 0 1-1.608 0V6.652c0-.444.36-.804.804-.804Zm1.071 7.232a1.071 1.071 0 1 1-2.142 0 1.071 1.071 0 0 1 2.142 0Z"
      clipRule="evenodd"
    />
  </svg>
);
