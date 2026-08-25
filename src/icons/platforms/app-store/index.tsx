import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AppStoreIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="48"
    height="48"
    viewBox="0 0 48 48"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_13264_277486)" fill="currentColor">
      <path d="M36.617 25.233a10.909 10.909 0 0 1 5.194-9.152 11.166 11.166 0 0 0-8.797-4.756c-3.702-.389-7.29 2.215-9.176 2.215-1.923 0-4.827-2.177-7.954-2.112a11.717 11.717 0 0 0-9.86 6.012c-4.263 7.381-1.083 18.228 3 24.195 2.044 2.92 4.432 6.184 7.556 6.068 3.058-.126 4.2-1.95 7.89-1.95 3.656 0 4.728 1.95 7.915 1.877 3.281-.053 5.348-2.934 7.32-5.884a24.164 24.164 0 0 0 3.347-6.816 10.54 10.54 0 0 1-6.435-9.697ZM30.594 7.401A10.74 10.74 0 0 0 33.05-.293a10.928 10.928 0 0 0-7.07 3.658 10.22 10.22 0 0 0-2.52 7.41A9.036 9.036 0 0 0 30.593 7.4Z" />
    </g>
    <defs>
      <clipPath id="clip0_13264_277486">
        <path fill="currentColor" d="M0 0h48v48H0z" />
      </clipPath>
    </defs>
  </svg>
);
