import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MarginIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M7.997 6.666v2.667m1.334-1.334H6.664m6.667 0h-1.778M4.442 8H2.664m5.333-5.333v1.778m0 7.11v1.779m4.445-10.667h-8.89a.889.889 0 0 0-.888.889v8.889c0 .49.398.889.889.889h8.889a.889.889 0 0 0 .889-.89V3.556a.889.889 0 0 0-.89-.889Z"
      />
    </svg>
  );
};
