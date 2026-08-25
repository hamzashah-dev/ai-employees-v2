import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SlideIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <g clipPath="url(#clip0_1263_7009)">
      <path
        d="M0 6C0 2.68629 2.68629 0 6 0H18C21.3137 0 24 2.68629 24 6V18C24 21.3137 21.3137 24 18 24H6C2.68629 24 0 21.3137 0 18V6Z"
        fill="#F4B70A"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.4375 4.5C4.91973 4.5 4.5 4.91973 4.5 5.4375V18.5625C4.5 19.0803 4.91973 19.5 5.4375 19.5H18.5625C19.0803 19.5 19.5 19.0803 19.5 18.5625V5.4375C19.5 4.91973 19.0803 4.5 18.5625 4.5H5.4375ZM17.625 8.71875H6.375V15.2812H17.625V8.71875Z"
        fill="white"
      />
    </g>
    <defs>
      <clipPath id="clip0_1263_7009">
        <rect width="24" height="24" rx="5" fill="white" />
      </clipPath>
    </defs>
  </svg>
);
