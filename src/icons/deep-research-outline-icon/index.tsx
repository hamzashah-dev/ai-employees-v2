import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DeppResearchOutlineIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M11.495 14.25 8.85 9.417 6.205 14.25M8.85 9.417v4.814m-.527-7.967-2.748.963c-.742.26-1.124 1.05-.854 1.764l.13.344c.27.714 1.09 1.082 1.832.822l2.747-.963M4.543 8.52l-1.825.64a.68.68 0 0 0-.425.878.72.72 0 0 0 .911.409l1.825-.64m3.598-2.735c-.27-.715.113-1.504.854-1.764l4.324-1.515c.37-.13.78.054.915.41l.987 2.61a.68.68 0 0 1-.427.882L10.957 9.21c-.742.26-1.562-.109-1.832-.823z"
    />
  </svg>
);
