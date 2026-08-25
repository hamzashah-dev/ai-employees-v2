import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SlideDeckIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="16" height="16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.667 2.667h10.667M2.667 13.333h10.667M2.667 6.061v3.878c0 .536.367.97.82.97h9.026c.453 0 .82-.434.82-.97V6.061c0-.536-.367-.97-.82-.97H3.488c-.454 0-.821.434-.821.97"
    />
  </svg>
);
