import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageVectorIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="19"
    height="20"
    fill="none"
    viewBox="0 0 19 20"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m18.26 15.565-1.639-3.152a2.396 2.396 0 0 0-1.79-1.279 2.418 2.418 0 0 0-2.093.699c-.307.315-.74.47-1.176.417a1.414 1.414 0 0 1-1.054-.673L8.69 8.609a2.399 2.399 0 0 0-1.979-1.16 2.417 2.417 0 0 0-2.058 1.012L.458 14.314a2.395 2.395 0 0 0-.223 2.445 2.396 2.396 0 0 0 2.024 1.386l13.68.957a2.394 2.394 0 0 0 2.196-1.09 2.394 2.394 0 0 0 .124-2.447ZM14.837 6.509a3.262 3.262 0 0 0 3.478-3.023A3.263 3.263 0 0 0 15.291.008a3.263 3.263 0 0 0-3.478 3.023 3.262 3.262 0 0 0 3.024 3.478Z"
      clipRule="evenodd"
    />
  </svg>
);
