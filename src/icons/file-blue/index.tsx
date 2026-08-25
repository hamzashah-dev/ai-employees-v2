import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FileBlueIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="54"
    height="65"
    viewBox="0 0 54 65"
    fill="none"
    className={className}
  >
    <path
      d="M53.25 23.52v29.73A11.254 11.254 0 0 1 42 64.5H12A11.254 11.254 0 0 1 .75 53.25v-42A11.254 11.254 0 0 1 12 0h19.77c.664-.001 1.327.06 1.98.18a11.178 11.178 0 0 1 6.69 3.87l10.2 12.27a11.16 11.16 0 0 1 2.58 6.18c0 .33.03.69.03 1.02Z"
      fill="#007BFF"
    />
    <path
      d="M39 34.5H15a2.25 2.25 0 0 1 0-4.5h24a2.25 2.25 0 0 1 0 4.5Zm-6 12H15a2.25 2.25 0 0 1 0-4.5h18a2.25 2.25 0 0 1 0 4.5Z"
      fill="#fff"
    />
    <path
      d="M53.22 22.5H42a8.247 8.247 0 0 1-8.25-8.25V.18a11.178 11.178 0 0 1 6.69 3.87l10.2 12.27a11.16 11.16 0 0 1 2.58 6.18Z"
      fill="#AFCBF9"
    />
  </svg>
);
