import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SuiteIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      fill="#1567ff"
      d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
    />
    <path
      fill="#fff"
      fillRule="evenodd"
      d="M8.583 3H5a.97.97 0 0 0-.707.314c-.188.2-.293.473-.293.757v7.858c0 .284.105.556.293.757.187.201.442.314.707.314h6c.265 0 .52-.113.707-.314.188-.2.293-.473.293-.757V6.66H9c-.23 0-.417-.2-.417-.447zm3.138 2.768-2.304-2.47v2.47z"
      clipRule="evenodd"
    />
  </svg>
);
