import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const TokenIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="46"
    height="46"
    viewBox="0 0 46 46"
    fill="none"
    className={className}
  >
    <path
      d="M7.1806 24.7297C5.27314 24.3922 5.27313 21.6078 7.1806 21.2704C14.0909 20.0479 19.5872 14.6957 21.0871 7.72826L21.2021 7.19417C21.6148 5.27721 24.299 5.26528 24.7282 7.1785L24.8678 7.80091C26.4232 14.7355 31.9208 20.0425 38.8122 21.2616C40.7293 21.6007 40.7293 24.3993 38.8122 24.7385C31.9208 25.9576 26.4232 31.2646 24.8678 38.199L24.7282 38.8215C24.299 40.7348 21.6148 40.7227 21.2021 38.8059L21.0871 38.2718C19.5872 31.3044 14.0909 25.9521 7.1806 24.7297Z"
      fill="currentColor"
    />
  </svg>
);
