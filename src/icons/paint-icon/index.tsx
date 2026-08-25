import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PaintIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    className={className}
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="m13.569 10.519 2.372 2.307m3.18.002.977 1a3.166 3.166 0 0 1 0 4.426l-1.793 1.831a3.02 3.02 0 0 1-4.332 0m-8.91-9.106-.782-.799a3.184 3.184 0 0 1 0-4.425l1.794-1.833a3.004 3.004 0 0 1 4.331 0l.99 1.012m8.4-.719a2.37 2.37 0 0 0-3.289-.029L10.482 9.54c-1.345 1.264-1.364 3.429-.04 4.717a3.116 3.116 0 0 0 4.61-.272l4.936-6.413a2.5 2.5 0 0 0-.191-3.356M3.512 20.987s.703-.793 4.621-.556 4.646-3.902 2.17-6.31c-1.82-1.772-4.822-1.027-5.646 1.398l-1.628 4.792a.508.508 0 0 0 .483.676"
    />
  </svg>
);
