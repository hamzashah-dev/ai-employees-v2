import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SmartPhoneIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <g id="smartphone">
      <path
        id="Vector"
        d="M10.001 15h.009M5.835 1.667h8.333c.92 0 1.667.746 1.667 1.667v13.333c0 .92-.747 1.667-1.667 1.667H5.835c-.92 0-1.667-.747-1.667-1.667V3.334c0-.92.746-1.667 1.667-1.667Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);
