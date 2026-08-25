import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LayersIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeWidth="1.2"
      d="m13.516 7.442 1.367.665.334.169c.71.36.71 1.286 0 1.646l-4.528 2.289a3.782 3.782 0 0 1-3.378 0l-4.528-2.29c-.71-.359-.71-1.286 0-1.645l.334-.17 1.33-.685m9.128 3.33 1.51.691c.746.339.77 1.297.04 1.666l-4.436 2.244c-1.05.53-2.329.53-3.379 0L2.938 13.14c-.742-.376-.701-1.355.07-1.678l1.52-.66m2.783-8.155-4.528 2.29c-.71.36-.71 1.286 0 1.646l4.528 2.29a3.782 3.782 0 0 0 3.378 0l4.528-2.29c.71-.36.71-1.287 0-1.646l-4.528-2.29a3.782 3.782 0 0 0-3.378 0Z"
    />
  </svg>
);
