import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CreditIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M5.807 6.005a.49.49 0 0 0 .196-.197L7.57 2.924a.49.49 0 0 1 .86 0l1.567 2.884a.49.49 0 0 0 .196.197l2.885 1.567a.49.49 0 0 1 0 .86l-2.885 1.566a.489.489 0 0 0-.196.196L8.43 13.08a.49.49 0 0 1-.86 0l-1.567-2.885a.488.488 0 0 0-.196-.196L2.922 8.431a.49.49 0 0 1 0-.86l2.885-1.566Z"
      fill="currentColor"
    />
  </svg>
);
