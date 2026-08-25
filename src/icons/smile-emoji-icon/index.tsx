import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const SmileEmojiIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M5.6 9.2C5.6 9.2 6.5 10.4 8 10.4C9.5 10.4 10.4 9.2 10.4 9.2M6.2 6.2H6.206M9.8 6.2H9.806M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
