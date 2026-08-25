import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const HomeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 3.2 21 11h-2.2v8.8h-4.6v-5.4H9.8v5.4H5.2V11H3l9-7.8Z" />
  </svg>
);
