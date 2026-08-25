import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SettingsSliderIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M16.666 5.833h-7.5m2.5 8.334h-7.5m7.5 0a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0ZM8.333 5.833a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
