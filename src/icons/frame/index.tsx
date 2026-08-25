import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FrameIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M22 6H2M22 18H2M6 2v20M18 2v20" />
  </svg>
);
