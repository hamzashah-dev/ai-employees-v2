import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CopyIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M5.805 3.649C5.975 2.665 6.765 2 7.954 2h3.859C13.156 2 14 2.857 14 4.067V8.53c0 1.103-.702 1.915-1.853 2.043M4.187 5.41h3.858c1.344 0 2.187.854 2.187 2.064v4.463c0 1.21-.838 2.064-2.187 2.064H4.188C2.838 14 2 13.146 2 11.936V7.473c0-1.21.839-2.064 2.187-2.064Z"
    />
  </svg>
);
