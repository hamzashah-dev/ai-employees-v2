import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const UnderlineIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="currentStroke"
        d="M2.664 14h10.667M4.886 2v6c0 1.784 1.393 3.23 3.111 3.23 1.719 0 3.111-1.446 3.111-3.23V2"
      />
    </svg>
  );
};
