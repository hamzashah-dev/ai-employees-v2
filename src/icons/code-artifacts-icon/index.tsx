import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CodeArtifactsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    className={className}
    viewBox="0 0 16 16"
  >
    <g clipPath="url(#code-artifacts-clip)">
      <path
        fill="#ededed"
        d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
      />
      <path
        fill="#0f0f0f"
        fillOpacity=".5"
        fillRule="evenodd"
        d="M9.854 4.239a.563.563 0 1 0-1.067-.358l-2.644 7.878a.562.562 0 1 0 1.067.358zm-3.84 1.076a.56.56 0 0 0-.795-.003L2.916 7.6a.563.563 0 0 0 0 .798l2.303 2.288a.563.563 0 0 0 .793-.799L4.11 8l1.9-1.889a.563.563 0 0 0 .003-.795m3.969 0a.56.56 0 0 1 .795-.003L13.081 7.6a.563.563 0 0 1 0 .798l-2.303 2.288a.562.562 0 1 1-.793-.799L11.887 8 9.985 6.11a.563.563 0 0 1-.002-.795"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="code-artifacts-clip">
        <rect width="16" height="16" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
