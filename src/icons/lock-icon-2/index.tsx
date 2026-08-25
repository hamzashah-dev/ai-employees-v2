import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LockIcon2: FC<PropsWithClassName> = ({ className }) => (
  <svg width="14" height="14" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M10.622 6.76a.826.826 0 0 0-.826-.825h-5.78a.826.826 0 0 0-.827.826v4.13a.826.826 0 0 0 .826.825H7.27m2.527-5.87v-.573a2.89 2.89 0 1 0-5.78 0v.573m6.607.915v4.13a.826.826 0 0 1-.825.825H6.544"
    />
  </svg>
);
