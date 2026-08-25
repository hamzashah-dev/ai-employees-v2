import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LongMemoPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#45A1C3"
      d="M23.813 11.5h-1.875a2.813 2.813 0 0 1-2.813-2.813V6.813A2.813 2.813 0 0 0 16.312 4h-7.5A2.813 2.813 0 0 0 6 6.813v18.375A2.813 2.813 0 0 0 8.813 28h15a2.813 2.813 0 0 0 2.812-2.813V14.313a2.813 2.813 0 0 0-2.813-2.812Zm-2.344 12.75H11.156a1.406 1.406 0 0 1 0-2.813H21.47a1.406 1.406 0 0 1 0 2.813Zm0-5.625H11.156a1.406 1.406 0 0 1 0-2.813H21.47a1.406 1.406 0 0 1 0 2.813Z"
    />
  </svg>
);
