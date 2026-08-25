import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MergeIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M2.667 8.001H7.11m0 0L5.333 6.224M7.111 8 5.333 9.78m8-1.778H8.89m0 0 1.777-1.777M8.89 8l1.777 1.778m-8-4.444V3.557c0-.484.405-.889.89-.889h2.666c.484 0 .889.405.889.889v1.778m1.778 0V3.557c0-.484.404-.889.889-.889h2.666c.484 0 .89.405.89.889v1.778M2.666 10.668v1.778c0 .484.404.889.888.889h2.667a.898.898 0 0 0 .889-.89v-1.777m1.778 0v1.778c0 .484.404.889.889.889h2.666a.898.898 0 0 0 .89-.89v-1.777"
      />
    </svg>
  );
};
