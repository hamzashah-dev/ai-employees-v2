import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageErrorIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      className={className}
    >
      <path
        d="m3 3 30 30M15.615 15.615a3.002 3.002 0 0 1-4.245-4.245m8.88 8.88L9 31.5M27 18l4.5 4.5v-15a3 3 0 0 0-3-3h-15m-8.115.885A2.985 2.985 0 0 0 4.5 7.5v21a3 3 0 0 0 3 3h21c.825 0 1.578-.33 2.115-.885"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
