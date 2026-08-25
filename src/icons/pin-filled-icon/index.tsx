import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const PinFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      fill="currentColor"
      d="m10.532 8.592 3.023-1.95a.924.924 0 0 0 .194-1.424l-2.967-2.967a.924.924 0 0 0-1.424.194L7.361 5.431l-4.15.924a.555.555 0 0 0-.268.925l5.685 5.694a.564.564 0 0 0 .924-.278l.98-4.104Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.3"
      d="M5.78 10.191 2 14m8.532-5.408 3.023-1.95a.924.924 0 0 0 .194-1.424l-2.967-2.967a.924.924 0 0 0-1.424.194L7.361 5.431l-4.15.924a.555.555 0 0 0-.268.925l5.685 5.694a.564.564 0 0 0 .924-.278l.98-4.104Z"
    />
  </svg>
);
