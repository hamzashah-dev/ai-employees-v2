import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MessageIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M17.5 10C17.5 5.85785 14.1421 2.5 10 2.5C5.85785 2.5 2.5 5.85785 2.5 10C2.5 11.3577 2.86077 12.6312 3.49168 13.7297C3.16235 14.5908 2.85159 15.5931 2.6505 16.5926C2.56021 17.0414 2.95554 17.4211 3.40129 17.3167C4.35882 17.0925 5.33309 16.7781 6.18727 16.46C7.30447 17.1207 8.60797 17.5 10 17.5C14.1421 17.5 17.5 14.1421 17.5 10Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
