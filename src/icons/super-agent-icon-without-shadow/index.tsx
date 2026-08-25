import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SuperAgentIconWithoutShadow: FC<PropsWithClassName> = ({
  className,
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        fill="#d9d9d9"
        fillRule="evenodd"
        d="M10.512 2.403a2.96 2.96 0 0 1 2.976 0l6.024 3.502A3 3 0 0 1 21 8.5v7.003a3 3 0 0 1-1.488 2.595L13.488 21.6a2.96 2.96 0 0 1-2.976 0l-6.024-3.502A3 3 0 0 1 3 15.503V8.5a3 3 0 0 1 1.488-2.595zm1.489 5.003A6.88 6.88 0 0 1 7.438 12 6.88 6.88 0 0 1 12 16.596a6.88 6.88 0 0 1 4.563-4.595 6.88 6.88 0 0 1-4.563-4.595"
        clipRule="evenodd"
      />
      <path
        fill="#525252"
        fillRule="evenodd"
        d="M10.512 2.403a2.96 2.96 0 0 1 2.976 0l6.024 3.502A3 3 0 0 1 21 8.5v7.003a3 3 0 0 1-1.488 2.595L13.488 21.6a2.96 2.96 0 0 1-2.976 0l-6.024-3.502A3 3 0 0 1 3 15.503V8.5a3 3 0 0 1 1.488-2.595zm1.489 5.003A6.88 6.88 0 0 1 7.438 12 6.88 6.88 0 0 1 12 16.596a6.88 6.88 0 0 1 4.563-4.595 6.88 6.88 0 0 1-4.563-4.595"
        clipRule="evenodd"
      />
      <path
        fill="url(#sa-icon-without-shadow-grad)"
        fillRule="evenodd"
        d="M10.512 2.403a2.96 2.96 0 0 1 2.976 0l6.024 3.502A3 3 0 0 1 21 8.5v7.003a3 3 0 0 1-1.488 2.595L13.488 21.6a2.96 2.96 0 0 1-2.976 0l-6.024-3.502A3 3 0 0 1 3 15.503V8.5a3 3 0 0 1 1.488-2.595zm1.489 5.003A6.88 6.88 0 0 1 7.438 12 6.88 6.88 0 0 1 12 16.596a6.88 6.88 0 0 1 4.563-4.595 6.88 6.88 0 0 1-4.563-4.595"
        clipRule="evenodd"
      />
      <defs>
        <linearGradient
          id="sa-icon-without-shadow-grad"
          x1="3"
          x2="21"
          y1="12.002"
          y2="12.002"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#8b72f7" />
          <stop offset=".505" stopColor="#ff8789" />
          <stop offset="1" stopColor="#ffb42b" />
        </linearGradient>
      </defs>
    </svg>
  );
};
