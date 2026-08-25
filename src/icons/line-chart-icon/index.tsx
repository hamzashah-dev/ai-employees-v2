import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LineChartIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M16.6654 16.6673H4.9987C4.07822 16.6673 3.33203 15.9212 3.33203 15.0007V3.33398M6.70483 10.7624L9.39745 8.16163L11.9715 10.4291L15.7626 6.69645M13.6059 6.6973H15.7622V8.85358"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
