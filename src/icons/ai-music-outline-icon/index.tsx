import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIMusicOutlineIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinejoin="round"
      d="M14.002 9.812V2.466a.48.48 0 0 0-.182-.37.46.46 0 0 0-.4-.08l-7.385 2.08a.473.473 0 0 0-.342.45v7.608m0-5.077 8.309-2.308M3.846 14a1.846 1.846 0 1 0 0-3.692 1.846 1.846 0 0 0 0 3.692Zm8.308-2.307a1.846 1.846 0 1 0 0-3.693 1.846 1.846 0 0 0 0 3.693Z"
    />
  </svg>
);
