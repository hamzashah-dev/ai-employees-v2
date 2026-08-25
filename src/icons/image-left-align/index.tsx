import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ImageLeftAlignIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="12"
    viewBox="0 0 14 12"
    fill="none"
    className={className}
  >
    <path
      d="M0.601562 11.2663V0.599609M3.0261 3.39586V2.15911C3.0261 1.39269 3.71795 0.771478 4.5715 0.771478H7.86412C8.71768 0.771478 9.40949 1.39269 9.40949 2.15911V3.39586C9.40949 4.16227 8.71768 4.7835 7.86412 4.7835H4.5715C3.71795 4.7835 3.0261 4.16227 3.0261 3.39586ZM3.0261 9.70706V8.47032C3.0261 7.70391 3.71795 7.08266 4.5715 7.08266H11.0562C11.9097 7.08266 12.6016 7.70391 12.6016 8.47032V9.70706C12.6016 10.4735 11.9097 11.0947 11.0562 11.0947H4.5715C3.71795 11.0947 3.0261 10.4735 3.0261 9.70706Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
