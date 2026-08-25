import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DeepResearchIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <g clipPath="url(#deep-research-icon-clip-path)">
      <path
        fill="#1567ff"
        d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
      />
      <path
        fill="#fff"
        d="M7.889 11.985V8.317zM7.724 6.53c-.2-.544.083-1.146.633-1.344l3.202-1.154a.53.53 0 0 1 .678.313l.73 1.988a.523.523 0 0 1-.315.672L9.449 8.16a1.06 1.06 0 0 1-1.356-.627z"
      />
      <path
        fill="#fff"
        d="m7.498 5.915-2.035.734c-.55.198-.833.8-.633 1.344l.097.262c.2.544.807.825 1.356.627l2.036-.734"
      />
      <path
        fill="#fff"
        d="m4.699 7.634-1.352.487a.52.52 0 0 0-.315.669c.1.27.402.41.675.312l1.352-.488"
      />
      <path
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m5.93 12 1.959-3.683m0 0L9.848 12M7.889 8.317v3.668m-.39-6.07-2.036.734c-.55.198-.833.8-.633 1.344l.097.262c.2.544.807.825 1.356.627l2.036-.734m-3.62-.514-1.352.487a.52.52 0 0 0-.315.669c.1.27.402.41.675.312l1.352-.488M7.724 6.53c-.2-.544.083-1.146.633-1.344l3.202-1.154a.53.53 0 0 1 .678.313l.73 1.988a.523.523 0 0 1-.315.672L9.449 8.16a1.06 1.06 0 0 1-1.356-.627z"
      />
    </g>
    <defs>
      <clipPath id="deep-research-icon-clip-path">
        <rect width="16" height="16" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
