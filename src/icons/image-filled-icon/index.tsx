import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="32"
    height="32"
    fill="none"
    viewBox="0 0 32 32"
    className={className}
  >
    <g clipPath="url(#a)">
      <path
        fill="#dd1af3"
        d="M0 8a8 8 0 0 1 8-8h16a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8H8a8 8 0 0 1-8-8z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M10.779 13.875a2.47 2.47 0 0 1 2.464-2.468 2.47 2.47 0 0 1 2.466 2.467 2.47 2.47 0 0 1-2.466 2.467 2.47 2.47 0 0 1-2.464-2.467m2.75 6.92c2.557-3.072 7.57-4.63 11.51-4.704a.3.3 0 0 0 .294-.298v-3.7c0-3.247-2.088-5.427-5.195-5.427h-8.286c-3.101 0-5.186 2.18-5.186 5.426v7.812c0 3.133 2.105 5.276 5.126 5.42.175.01.312-.145.301-.32-.093-1.534.387-2.949 1.437-4.209"
        clipRule="evenodd"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M14.662 21.739c-.87 1.045-.998 2.043-1.067 3.284-.01.168.125.31.294.31h6.25c3.106 0 5.194-2.182 5.194-5.429v-2.033a.29.29 0 0 0-.313-.292c-3.73.292-8.285 1.668-10.358 4.16"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="a">
        <rect width="32" height="32" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
