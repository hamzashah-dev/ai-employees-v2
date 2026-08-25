import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const TableOfContentsIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="13"
      height="11"
      viewBox="0 0 13 11"
      fill="none"
      className={className}
    >
      <path
        d="M4.30556 1.13889H11.4167M7.63889 5.41667H11.4167M4.30556 9.69444H11.4167M1.19444 1.52778C1.4399 1.52778 1.63889 1.35366 1.63889 1.13889C1.63889 0.924113 1.4399 0.75 1.19444 0.75C0.948987 0.75 0.75 0.924113 0.75 1.13889C0.75 1.35366 0.948987 1.52778 1.19444 1.52778ZM4.52778 5.80556C4.77324 5.80556 4.97222 5.63144 4.97222 5.41667C4.97222 5.20189 4.77324 5.02778 4.52778 5.02778C4.28232 5.02778 4.08333 5.20189 4.08333 5.41667C4.08333 5.63144 4.28232 5.80556 4.52778 5.80556ZM1.19444 10.0833C1.4399 10.0833 1.63889 9.90919 1.63889 9.69444C1.63889 9.4797 1.4399 9.30556 1.19444 9.30556C0.948987 9.30556 0.75 9.4797 0.75 9.69444C0.75 9.90919 0.948987 10.0833 1.19444 10.0833Z"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
