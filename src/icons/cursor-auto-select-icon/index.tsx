import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CursorAutoSelectIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    fill="none"
    viewBox="0 0 14 14"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.4"
      d="M1.75 9.02a.81.81 0 0 0 .808.807m0-8.077a.81.81 0 0 0-.808.808m8.077 0a.81.81 0 0 0-.808-.808m-4.038 0h1.615M4.981 9.827h.404M9.827 4.98v.404M1.75 4.98v1.615M12.035 8.74c.068-.028.112-.04.152-.08a.215.215 0 0 0 0-.305c-.04-.04-.054-.064-.152-.093s-4.87-1.642-4.87-1.642a.43.43 0 0 0-.546.546s1.651 4.805 1.672 4.87.046.112.086.152a.215.215 0 0 0 .304 0c.04-.04.05-.063.08-.152l.844-2.433s2.362-.834 2.43-.863"
    />
  </svg>
);
