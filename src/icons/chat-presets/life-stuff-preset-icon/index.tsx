import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LifeStuffPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    className={className}
    viewBox="0 0 24 24"
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M17.053 11.768h.653a2.603 2.603 0 0 1 0 5.205h-.653M6.783 4.69a1.194 1.194 0 0 0 0 1.69m7.526-1.69a1.194 1.194 0 0 0 0 1.69M10.548 3a1.195 1.195 0 0 1 0 1.69 1.194 1.194 0 0 0 0 1.69M11.554 21H9.19a5.5 5.5 0 0 1-5.499-5.498v-3.476A2.71 2.71 0 0 1 6.4 9.318h7.946a2.71 2.71 0 0 1 2.708 2.708v3.476a5.5 5.5 0 0 1-5.5 5.498"
    />
  </svg>
);
