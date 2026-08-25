import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AiStarFilled: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M7.701 2.241c-.238-.655-1.164-.655-1.402 0L5.217 5.217 2.24 6.299c-.655.238-.655 1.164 0 1.402l2.976 1.082 1.082 2.976c.238.655 1.164.655 1.402 0l1.082-2.976 2.976-1.082c.655-.238.655-1.164 0-1.402L8.783 5.217 7.701 2.24Z"
      clipRule="evenodd"
    />
  </svg>
);
