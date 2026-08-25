import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AndroidIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <g id="android">
        <path
          id="Vector"
          d="m13.2 7.11 1.38-2.385a.476.476 0 0 0-.195-.638.478.478 0 0 0-.623.165l-1.41 2.43a8.595 8.595 0 0 0-6.705 0l-1.41-2.43a.482.482 0 0 0-.652-.15.478.478 0 0 0-.165.623L4.8 7.11A8.085 8.085 0 0 0 .75 13.5h16.5a8.085 8.085 0 0 0-4.05-6.39Zm-7.95 4.327a.938.938 0 1 1 0-1.875.938.938 0 0 1 0 1.875Zm7.5 0a.938.938 0 1 1 0-1.875.938.938 0 0 1 0 1.875Z"
          fill="currentColor"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
};
