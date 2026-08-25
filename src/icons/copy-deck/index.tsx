import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CopyDeckIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="17"
    height="17"
    fill="none"
    viewBox="0 0 17 17"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="m9.174 15.05 3.473.931a.548.548 0 0 0 .671-.387l2.663-9.944a.548.548 0 0 0-.387-.67l-3.743-1.005M9.023 1.406a.548.548 0 0 0-.67-.387l-6.947 1.86a.548.548 0 0 0-.387.671l2.665 9.943a.548.548 0 0 0 .671.387l6.947-1.86a.548.548 0 0 0 .387-.671L9.023 1.406Z"
    />
  </svg>
);
