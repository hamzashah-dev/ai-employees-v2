import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const KanbanIcon: FC<PropsWithClassName> = ({ className }) => (
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
      d="M12 6.75V11.25M7.5 6.75V17.25M16.5 6.75V14.25M3 4.5C3 3.67158 3.67158 3 4.5 3H19.5C20.3284 3 21 3.67158 21 4.5V19.5C21 20.3284 20.3284 21 19.5 21H4.5C3.67158 21 3 20.3284 3 19.5V4.5Z"
    />
  </svg>
);
