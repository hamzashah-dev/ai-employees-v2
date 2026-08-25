import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const LiveIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg className={className} width="16" height="16" fill="none">
    <circle cx="8" cy="8" r="5.333" fill="currentColor" opacity=".26" />
    <circle cx="8" cy="8" r="2.667" fill="currentColor" />
  </svg>
);
