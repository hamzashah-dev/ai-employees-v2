import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TextIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="22"
    height="22"
    fill="none"
    viewBox="0 0 22 22"
    className={className}
  >
    <rect width="22" height="22" fill="#888780" rx="6" />
    <path
      fill="#fff"
      d="M2.96 9.196V8.182h4.78v1.014H5.957V14H4.742V9.196zM9.8 8.182l1.173 1.983h.045l1.18-1.983h1.389L11.81 11.09 13.626 14h-1.414l-1.194-1.986h-.045L9.78 14H8.37l1.822-2.91-1.787-2.908zm4.464 1.014V8.182h4.779v1.014H17.26V14h-1.216V9.196z"
    />
  </svg>
);
