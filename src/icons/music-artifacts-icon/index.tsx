import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MusicArtifactsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    className={className}
    viewBox="0 0 16 16"
  >
    <g clipPath="url(#music-artifacts-clip)">
      <path
        fill="#00da5a"
        d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M11.228 3.657a.904.904 0 0 1 1.053.477.9.9 0 0 1 .094.4v5.351a1.76 1.76 0 1 1-1.125-1.642V6.674L6.144 8.093v3.527A1.76 1.76 0 1 1 5.02 9.974v-3.88a.92.92 0 0 1 .668-.876l5.537-1.56z"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="music-artifacts-clip">
        <rect width="16" height="16" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
