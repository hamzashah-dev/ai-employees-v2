import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ButtonLinesIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="22"
    height="30"
    viewBox="0 0 22 30"
    fill="none"
    className={className}
  >
    <path
      d="M19.066 27.563c-3.353-.633-6.688-1.208-9.986-2"
      stroke="url(#paint0_linear_7314_340150)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M16.402 13.37c-3.265 1.466-6.206 3.066-9.155 4.523"
      stroke="url(#paint1_linear_7314_340150)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <path
      d="M2.727 11.676A195.79 195.79 0 0 0 6 2.004"
      stroke="url(#paint2_linear_7314_340150)"
      strokeWidth="4"
      strokeLinecap="round"
    />
    <defs>
      <linearGradient
        id="paint0_linear_7314_340150"
        x1="19.066"
        y1="27.563"
        x2="18.299"
        y2="23.721"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#007BFF" />
        <stop offset="1" stopColor="#34C2DB" />
      </linearGradient>
      <linearGradient
        id="paint1_linear_7314_340150"
        x1="16.906"
        y1="15.305"
        x2="15.171"
        y2="11.793"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#007BFF" />
        <stop offset="1" stopColor="#34C2DB" />
      </linearGradient>
      <linearGradient
        id="paint2_linear_7314_340150"
        x1="7.727"
        y1="3.016"
        x2="4.016"
        y2="1.759"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#007BFF" />
        <stop offset="1" stopColor="#34C2DB" />
      </linearGradient>
    </defs>
  </svg>
);
