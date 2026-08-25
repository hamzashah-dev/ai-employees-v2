import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const EyeOffIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    strokeWidth="1"
    className={className}
  >
    <path
      d="M10.1389 4.27851C11.0677 4.90016 11.7911 5.78359 12.2172 6.81681C12.2609 6.93468 12.2609 7.06433 12.2172 7.18219C11.7911 8.21542 11.0677 9.09885 10.1389 9.72049C9.21013 10.3421 8.11765 10.674 7 10.674"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M3.86106 9.72049C2.93225 9.09885 2.20893 8.21542 1.78281 7.18219C1.73906 7.06433 1.73906 6.93468 1.78281 6.81681C2.20893 5.78359 2.93225 4.90016 3.86106 4.27851C4.78988 3.65687 5.88235 3.32501 7 3.32501"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.11396 5.88554C8.40898 6.17987 8.57492 6.5792 8.57492 6.9995C8.57492 7.86931 7.86981 8.57442 7 8.57442C6.5797 8.57442 6.18037 8.40848 5.88604 8.11346"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M11.6667 2.33333 2.33333 11.6667"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
