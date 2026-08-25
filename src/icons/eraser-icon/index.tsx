import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const EraserIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.125"
      transform="translate(2.438 2.438)"
      d="M2.53383 5.92025L7.19307 10.5795M1.09444 9.91371L3.21127 12.0306C3.90961 12.7289 5.06625 12.7289 5.76459 12.0306L12.0387 5.75641C12.7371 5.05807 12.7371 3.90143 12.0387 3.20309L9.9219 1.08626C9.22356 0.387915 8.06693 0.387915 7.36859 1.08626L1.09444 7.36041C0.385187 8.05875 0.385187 9.20446 1.09444 9.91371Z"
    />
  </svg>
);
