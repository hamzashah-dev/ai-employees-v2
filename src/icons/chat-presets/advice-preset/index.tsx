import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AdvicePresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="29"
    height="29"
    viewBox="0 0 29 29"
    fill="none"
    className={className}
  >
    <path
      d="M13.5 20.292a2 2 0 0 1-2-2v-2.667a2 2 0 0 1 2-2c.402-.004 4-.667 4-3.333 0-1.334-1.333-2.667-3.333-2.667-1.628 0-2.667 1.333-2.667 2a2 2 0 0 1-4 0c0-3.252 3.053-6 6.667-6 5.333 0 7.333 3.988 7.333 7.333 0 2.764-1.518 4.876-4.275 5.948-.6.233-1.194.391-1.725.498v.888a2 2 0 0 1-2 2Zm2 3.333a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z"
      fill="#D434CF"
    />
  </svg>
);
