import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    className={className}
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M8.753 21.002C8.101 15.66 15.538 13 21 12.669m0-4.642v7.953c0 2.946-1.843 5.024-4.788 5.024H7.778C4.833 21.004 3 18.926 3 15.979V8.028c0-2.946 1.843-5.023 4.778-5.023h8.434C19.157 3.004 21 5.08 21 8.027M10.829 9.783a1.697 1.697 0 1 1-3.395.001 1.697 1.697 0 0 1 3.395-.001"
    />
  </svg>
);
