import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PodcastArtifactsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    className={className}
  >
    <g clipPath="url(#a)">
      <path
        fill="#ff2525"
        d="M0 3.5A3.5 3.5 0 0 1 3.5 0h7A3.5 3.5 0 0 1 14 3.5v7a3.5 3.5 0 0 1-3.5 3.5h-7A3.5 3.5 0 0 1 0 10.5z"
      />
      <path
        fill="#fff"
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth=".2"
        d="M10.182 5.943c.236 0 .418.2.418.436 0 1.967-1.382 3.603-3.182 3.825v.834a.43.43 0 0 1-.418.437.43.43 0 0 1-.418-.437v-.834C4.782 9.982 3.401 8.346 3.4 6.38c0-.236.182-.436.418-.436s.418.2.418.436c0 1.658 1.249 2.98 2.764 2.98s2.763-1.322 2.764-2.98c0-.236.182-.436.418-.436"
      />
      <path
        fill="#fff"
        d="M9.058 6.487V4.73c0-1.163-.922-2.106-2.058-2.106s-2.058.943-2.058 2.106v1.756c0 1.163.922 2.106 2.058 2.106s2.058-.943 2.058-2.106"
      />
    </g>
    <defs>
      <clipPath id="a">
        <rect width="14" height="14" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
