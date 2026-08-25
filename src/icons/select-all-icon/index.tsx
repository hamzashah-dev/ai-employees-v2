import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';


export const SelectAllIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M14 9.38462L10.3077 14L8.46154 12.6154M11.2308 8.5077V4.58462C11.2308 4.17678 10.9001 3.84616 10.4923 3.84616H4.58461C4.17677 3.84616 3.84615 4.17678 3.84615 4.58462V10.4923C3.84615 10.9001 4.17677 11.2308 4.58461 11.2308H6.61538M2 8.64615V2.73846C2 2.33062 2.33062 2 2.73846 2H8.64615"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
