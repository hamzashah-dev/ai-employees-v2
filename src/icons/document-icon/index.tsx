import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DocumentIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M15.246 15.92H8.753m6.493-4.057H8.753m2.478-4.047H8.753M8.041 21h7.918C18.191 21 20 19.155 20 16.88V7.12C20 4.845 18.19 3 15.96 3H8.04C5.81 3 4 4.845 4 7.12v9.76C4 19.155 5.81 21 8.04 21"
    />
  </svg>
);
