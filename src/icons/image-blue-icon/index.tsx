import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageBlueIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="64" height="64" fill="none" viewBox="0 0 64 64">
    <path
      fill="#E5F9F8"
      d="M48 3.333H16C9.004 3.333 3.333 9.004 3.333 16v32c0 6.996 5.671 12.667 12.667 12.667h32c6.996 0 12.667-5.671 12.667-12.667V16c0-6.996-5.671-12.667-12.667-12.667Z"
      className={className}
    />
    <path
      fill="#FF9603"
      d="M50 21.333a7.327 7.327 0 0 1-7.333 7.334 7.48 7.48 0 0 1-2.187-.32A7.342 7.342 0 0 1 42.667 14c.835.005 1.665.15 2.453.427A7.309 7.309 0 0 1 50 21.333Z"
    />
    <path
      fill="#007BFF"
      d="M60.667 42.053V48A12.677 12.677 0 0 1 48 60.667H16A12.677 12.677 0 0 1 3.333 48v-8.827l10.16-10.16a7.467 7.467 0 0 1 10.347 0l8.613 8.614.347.346a3.365 3.365 0 0 0 4.373.32l4-3.013a7.4 7.4 0 0 1 8.347-.32l11.147 7.093Z"
    />
  </svg>
);
