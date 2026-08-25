import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ModelTrainingIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.333"
      d="M3.729 9.74H2m12 0h-1.729M3.73 6.26H2m12 0h-1.729M6.26 3.729V2m0 12v-1.729M9.74 3.73V2m0 12v-1.729m1.582-8.542H4.678a.95.95 0 0 0-.95.949v6.644c0 .524.426.95.95.95h6.644a.95.95 0 0 0 .95-.95V4.678a.95.95 0 0 0-.95-.95m-5.536 4.51c-.267-.047-.267-.43 0-.477a2.42 2.42 0 0 0 1.946-1.864l.016-.074c.058-.264.434-.265.494-.002l.02.086a2.43 2.43 0 0 0 1.951 1.853c.269.046.269.432 0 .478a2.43 2.43 0 0 0-1.952 1.853l-.02.086c-.06.263-.435.262-.493-.002l-.016-.074a2.42 2.42 0 0 0-1.946-1.864"
    />
  </svg>
);
