import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FoldersIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 14 14"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1"
        d="M9.917 9.625v1.167a1.167 1.167 0 0 1-1.167 1.167H2.917a1.167 1.167 0 0 1-1.167-1.167v-5.25a1.167 1.167 0 0 1 1.167-1.167h1.166M5.25 2.042H7l1.167 1.167h2.916a1.167 1.167 0 0 1 1.167 1.166V8.46a1.167 1.167 0 0 1-1.167 1.166H5.25A1.167 1.167 0 0 1 4.083 8.46v-5.25A1.167 1.167 0 0 1 5.25 2.042"
      />
    </svg>
  );
};
