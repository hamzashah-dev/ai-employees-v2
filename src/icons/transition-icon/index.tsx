import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const TransitionIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <path
      d="M7.10554 11.6663L9.09151 7.78229C9.34342 7.28962 9.34342 6.70972 9.09151 6.21705L7.10554 2.33301M9.49167 11.6663L11.4776 7.78229C11.7296 7.28962 11.7296 6.70972 11.4776 6.21705L9.49167 2.33301M2.33325 3.49967V10.4997C2.33325 11.144 2.86741 11.6663 3.52632 11.6663H3.98204C4.43394 11.6663 4.84705 11.4167 5.04915 11.0214L6.70537 7.78229C6.95728 7.28962 6.95728 6.70972 6.70537 6.21705L5.04915 2.97792C4.84705 2.58268 4.43394 2.33301 3.98204 2.33301H3.52632C2.86741 2.33301 2.33325 2.85534 2.33325 3.49967Z"
      stroke="currentColor"
      strokeLinecap="round"
    />
  </svg>
);
