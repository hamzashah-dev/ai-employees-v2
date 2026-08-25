import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ScaleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M6.73991 17.027H13.2566M8.18016 11.9738H3.18848M16.6583 10.8004H11.6667M14.3008 5.69336L5.66407 7.08377M10.1274 6.34217V2.62695M11.4225 11.3478L14.2975 5.69258L17.2067 11.3478C15.5167 13.575 12.5183 13.3918 11.4225 11.3478ZM2.79297 12.7376L5.66712 7.08321L8.57634 12.7376C6.88714 14.9648 3.88797 14.7816 2.79297 12.7376Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
