import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PlaylistIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M2 4.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5Zm3.5 4a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1H6a.5.5 0 0 1-.5-.5Zm2 3.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1H8a.5.5 0 0 1-.5-.5Z"
      fill="currentColor"
      fillRule="evenodd"
      clipRule="evenodd"
    />
  </svg>
);
