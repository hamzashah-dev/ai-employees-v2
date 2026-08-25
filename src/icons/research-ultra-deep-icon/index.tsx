import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ResearchUltraDeepIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg fill="none" viewBox="14 14 28 28" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M31.276 31.276c-4.825 4.825-10.203 7.27-12.013 5.46s.636-7.187 5.46-12.012c4.826-4.826 10.204-7.27 12.014-5.46s-.636 7.187-5.46 12.012"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M24.724 31.276c4.825 4.825 10.203 7.27 12.013 5.46s-.636-7.187-5.46-12.012c-4.826-4.826-10.204-7.27-12.014-5.46s.635 7.187 5.46 12.012"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M28 28.778a.778.778 0 0 1 0-1.556M28 28.778a.778.778 0 1 0 0-1.556"
    />
  </svg>
);
