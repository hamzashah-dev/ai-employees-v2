import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CharacterIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2 4.667V3.333A1.333 1.333 0 0 1 3.333 2h1.334m6.666 0h1.334A1.333 1.333 0 0 1 14 3.333v1.334m0 6.666v1.334A1.334 1.334 0 0 1 12.667 14h-1.334m-6.666 0H3.333A1.334 1.334 0 0 1 2 12.667v-1.334m3.333-2s1 1.334 2.667 1.334c1.667 0 2.667-1.334 2.667-1.334M6 6h.007M10 6h.007"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
