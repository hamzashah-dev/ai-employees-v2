import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const HeaderFooterIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M3 3H15M3 15H15M3 6.81818V11.1818C3 11.7843 3.41328 12.2727 3.92308 12.2727H14.0769C14.5867 12.2727 15 11.7843 15 11.1818V6.81818C15 6.21569 14.5867 5.72727 14.0769 5.72727H3.92308C3.41328 5.72727 3 6.21569 3 6.81818Z"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
