import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const AlignTopIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M2.91675 1.75H11.0834M4.77281 6.19231L7.00008 3.76923M7.00008 3.76923L9.22735 6.19231M7.00008 3.76923V10.2308"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
