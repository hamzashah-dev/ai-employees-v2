import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FilePresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="33"
    viewBox="0 0 32 33"
    fill="none"
    className={className}
  >
    <path
      d="M23.813 12.125h-1.875a2.813 2.813 0 0 1-2.813-2.813V7.438a2.813 2.813 0 0 0-2.813-2.813h-7.5A2.813 2.813 0 0 0 6 7.438v18.375a2.813 2.813 0 0 0 2.813 2.812h15a2.813 2.813 0 0 0 2.812-2.813V14.938a2.813 2.813 0 0 0-2.813-2.812Zm-2.344 12.75H11.156a1.406 1.406 0 0 1 0-2.813H21.47a1.406 1.406 0 0 1 0 2.813Zm0-5.625H11.156a1.406 1.406 0 0 1 0-2.813H21.47a1.406 1.406 0 0 1 0 2.813Z"
      fill="#D82B2B"
    />
  </svg>
);
