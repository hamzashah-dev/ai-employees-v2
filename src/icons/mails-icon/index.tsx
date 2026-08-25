import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MailsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M1.66797 6.17489L9.27155 10.8407C9.71058 11.1101 10.292 11.1101 10.7311 10.8407L18.3346 6.17489M1.66797 14.6976V4.47035C1.66797 3.84276 2.24196 3.33398 2.95002 3.33398H17.0526C17.7607 3.33398 18.3346 3.84275 18.3346 4.47035V14.6976C18.3346 15.3252 17.7607 15.834 17.0526 15.834H2.95002C2.24196 15.834 1.66797 15.3252 1.66797 14.6976Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
