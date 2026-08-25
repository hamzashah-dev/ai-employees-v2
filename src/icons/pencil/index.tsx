import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PencilIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M13.076 7.71779L10.2822 4.92398M2.25 15.75L4.61382 15.4874C4.90262 15.4553 5.04702 15.4392 5.18199 15.3955C5.30174 15.3568 5.4157 15.302 5.52077 15.2327C5.63921 15.1546 5.74194 15.0519 5.94742 14.8464L15.1714 5.62243C15.9429 4.85094 15.9429 3.60011 15.1714 2.82862C14.3999 2.05713 13.1491 2.05713 12.3776 2.82862L3.15361 12.0526C2.94814 12.2581 2.8454 12.3608 2.7673 12.4792C2.69801 12.5843 2.64324 12.6983 2.60447 12.818C2.56078 12.953 2.54474 13.0974 2.51265 13.3862L2.25 15.75Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
