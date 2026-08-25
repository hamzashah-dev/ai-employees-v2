import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const EyeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M1.78281 7.18219C1.73906 7.06433 1.73906 6.93468 1.78281 6.81681C2.20893 5.78359 2.93225 4.90016 3.86106 4.27851C4.78988 3.65687 5.88235 3.32501 7 3.32501C8.11765 3.32501 9.21013 3.65687 10.1389 4.27851C11.0677 4.90016 11.7911 5.78359 12.2172 6.81681C12.2609 6.93468 12.2609 7.06433 12.2172 7.18219C11.7911 8.21542 11.0677 9.09885 10.1389 9.72049C9.21013 10.3421 8.11765 10.674 7 10.674C5.88235 10.674 4.78988 10.3421 3.86106 9.72049C2.93225 9.09885 2.20893 8.21542 1.78281 7.18219Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M7 8.57442C7.86981 8.57442 8.57492 7.86931 8.57492 6.9995C8.57492 6.1297 7.86981 5.42458 7 5.42458C6.1302 5.42458 5.42508 6.1297 5.42508 6.9995C5.42508 7.86931 6.1302 8.57442 7 8.57442Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
