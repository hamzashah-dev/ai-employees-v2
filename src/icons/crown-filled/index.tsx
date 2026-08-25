import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CrownFilledIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="13"
    viewBox="0 0 14 13" fill="none" className={className}>
    <path
      fill="currentColor"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m12.75 2.883-3.165 3.2L6.75.75 3.915 6.083.75 2.883l.857 6.934c0 .424.167.831.464 1.131.296.3.699.469 1.119.469h7.12c.42 0 .823-.169 1.12-.469.296-.3.463-.707.463-1.131z"
    />
  </svg>
);
