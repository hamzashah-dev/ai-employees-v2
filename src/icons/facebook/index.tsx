import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FacebookIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    className={className}
  >
    <path
      d="M12.375 6.462h-2.3V4.968c0-.561.377-.692.64-.692h1.622V1.809l-2.233-.01C7.624 1.8 7.06 3.64 7.06 4.818v1.645H5.625v2.543h1.434V16.2h3.016V9.005h2.036l.262-2.543h.002Z"
      fill="#156BFF"
    />
  </svg>
);
