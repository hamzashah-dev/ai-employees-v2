import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageArtifactsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    className={className}
    viewBox="0 0 16 16"
  >
    <g clipPath="url(#image-artifacts-clip)">
      <path
        fill="#dd1af3"
        d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M5.063 6.805c0-.765.622-1.388 1.387-1.388a1.389 1.389 0 0 1 0 2.775 1.39 1.39 0 0 1-1.387-1.387m1.548 3.893c1.438-1.729 4.257-2.605 6.474-2.646a.17.17 0 0 0 .165-.168V5.802c0-1.826-1.174-3.052-2.922-3.052H5.667c-1.744 0-2.917 1.226-2.917 3.052v4.395c0 1.762 1.184 2.967 2.883 3.049.1.004.176-.082.17-.181-.053-.863.218-1.659.808-2.367"
        clipRule="evenodd"
      />
      <path
        fill="#fff"
        fillRule="evenodd"
        d="M7.248 11.228c-.49.588-.561 1.15-.6 1.848a.165.165 0 0 0 .165.174h3.515c1.748 0 2.922-1.227 2.922-3.053V9.053a.164.164 0 0 0-.176-.164c-2.098.164-4.66.938-5.826 2.34"
        clipRule="evenodd"
      />
    </g>
    <defs>
      <clipPath id="image-artifacts-clip">
        <rect width="16" height="16" fill="#fff" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
