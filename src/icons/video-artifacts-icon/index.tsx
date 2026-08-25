import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const VideoArtifactsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    className={className}
    viewBox="0 0 16 16"
  >
    <g clipPath="url(#video-artifacts-clip)">
      <path
        fill="#00c7ea"
        d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
      />
      <path
        fill="#fff"
        d="M7.95 4.208c1.272 0 2.16.844 2.16 2.053v3.477c0 1.21-.888 2.053-2.16 2.053H4.91c-1.272 0-2.16-.843-2.16-2.053V6.261c0-1.21.888-2.053 2.16-2.053zm4.228 1.203a.75.75 0 0 1 .72.032c.22.133.352.364.352.616V9.94a.72.72 0 0 1-.351.617.76.76 0 0 1-.722.031l-.777-.377a.82.82 0 0 1-.466-.737V6.525c0-.314.178-.596.466-.736z"
      />
    </g>
    <defs>
      <clipPath id="video-artifacts-clip">
        <rect width="16" height="16" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
