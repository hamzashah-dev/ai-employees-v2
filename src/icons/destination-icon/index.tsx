import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DestinationIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg viewBox="0 0 20 20" fill="none" className={className}>
    <path
      d="M7.15427 2.50989V15.5016M12.8443 17.4692V4.41518M12.3887 17.4269L7.61135 15.6674C7.31865 15.5598 6.99595 15.5713 6.71135 15.6994L3.7227 17.0443C3.14784 17.3037 2.5 16.8777 2.5 16.2397V5.55274C2.5 4.91313 2.87216 4.33264 3.44946 4.07319L6.71135 2.60513C6.99595 2.47704 7.31865 2.46555 7.61135 2.57311L12.3887 4.33264C12.6813 4.4402 13.0041 4.42871 13.2887 4.30062L16.2773 2.95572C16.8522 2.69709 17.5 3.12322 17.5 3.76036V14.4481C17.5 15.0877 17.1278 15.6674 16.5505 15.9268L13.2887 17.3949C13.0041 17.523 12.6813 17.5344 12.3887 17.4269Z"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
