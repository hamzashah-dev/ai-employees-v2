import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StudyPresetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.2"
      d="M10 6.62s1.853-2.793 5.558-3.278c.609-.08 1.11.428 1.11 1.045V12.2c0 .617-.501 1.108-1.11 1.188-3.705.486-5.557 3.278-5.557 3.278m0-10.048v10.048m0-10.048S8.148 3.827 4.443 3.342c-.608-.08-1.109.428-1.109 1.045V12.2c0 .617.5 1.108 1.11 1.188C8.147 13.875 10 16.667 10 16.667"
    />
  </svg>
);
