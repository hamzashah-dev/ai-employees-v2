import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MathTutorPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <path
      fill="#A24FD5"
      d="M25.526 15.316a1.737 1.737 0 0 1-1.736 1.737H8.736a1.737 1.737 0 0 1 0-3.474H23.79a1.737 1.737 0 0 1 1.736 1.737ZM13.947 8.947a2.316 2.316 0 1 1 4.633 0 2.316 2.316 0 0 1-4.633 0Zm0 12.737a2.316 2.316 0 1 1 4.633 0 2.316 2.316 0 0 1-4.633 0Z"
    />
  </svg>
);
