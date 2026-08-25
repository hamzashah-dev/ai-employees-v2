import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ArrowDownIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      d="M12 18.5587V5M6 14L11.2929 18.7794C12.0135 19.5 11.9865 19.5 12.7071 18.7794L18 14"
      stroke="currentColor"
      strokeOpacity="0.5"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);
