import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const GymIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M4.30097 12.8568C4.30097 12.8568 5.26893 10.4759 8.17283 10.4759C11.0767 10.4759 12.0447 12.3806 12.0447 12.3806L10.1087 6.66634H8.80492C8.21586 6.66634 7.76337 6.15302 7.84668 5.57927L7.93537 4.9684C8.07163 4.03002 8.88843 3.33301 9.85185 3.33301H12.3346C12.7417 3.33301 13.1052 3.58355 13.2443 3.95992L16.5498 12.9035C16.7602 13.4729 16.6828 14.1069 16.3412 14.611L15.4444 15.9346C15.1343 16.3922 14.6174 16.6663 14.0647 16.6663H3.33301"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
