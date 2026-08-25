import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PaperIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.03 2.09v3.205a.99.99 0 0 0 .97.994c1.346.04 3.327.415 3.327 2.91m-.119 2.885a67.445 67.445 0 0 0 .114-5.17 3.676 3.676 0 0 0-.716-2.157A12.037 12.037 0 0 0 10.303 2.4a1.787 1.787 0 0 0-1.074-.387C8.839 2.004 8.432 2 7.997 2a47.2 47.2 0 0 0-3.475.119c-.935.066-1.677.833-1.736 1.797A67.336 67.336 0 0 0 2.664 8c0 1.4.042 2.766.122 4.084.06.964.801 1.731 1.736 1.797 1.098.078 2.16.119 3.475.119 1.316 0 2.378-.04 3.476-.119.934-.066 1.677-.833 1.735-1.797Z"
      />
    </svg>
  );
};
