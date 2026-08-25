import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const BorderIcon: FC<PropsWithClassName> = ({ className }) => {
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
        strokeWidth="currentStroke"
        d="M7.997 2.666v10.667m5.334-5.334H2.664m10.667-4.444v8.889c0 .49-.398.889-.89.889H3.554a.889.889 0 0 1-.889-.89V3.556c0-.491.398-.889.889-.889h8.889c.49 0 .889.398.889.889Z"
      />
    </svg>
  );
};
