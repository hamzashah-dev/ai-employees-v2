import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CoffeeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      d="M18.136 6.462H5.864m12.272 0c.754 0 1.364.62 1.364 1.384v2.77c0 .764-.61 1.384-1.364 1.384m0-5.538L16.773 3H7.227L5.864 6.462m0 0c-.753 0-1.364.62-1.364 1.384v2.77C4.5 11.38 5.11 12 5.864 12m0 0h12.272M5.864 12l1.363 9h9.546l1.363-9"
    />
  </svg>
);
