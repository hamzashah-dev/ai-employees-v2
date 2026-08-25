import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DragHandleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
  >
    <circle cx="9" cy="5" r="1.4" />
    <circle cx="9" cy="12" r="1.4" />
    <circle cx="9" cy="19" r="1.4" />
    <circle cx="15" cy="5" r="1.4" />
    <circle cx="15" cy="12" r="1.4" />
    <circle cx="15" cy="19" r="1.4" />
  </svg>
);
