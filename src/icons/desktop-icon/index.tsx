import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const DesktopIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M5.83333 16.6663H14.1667M7.5 13.333V16.6663M12.5 13.333V16.6663M2.5 4.16634C2.5 3.94533 2.5878 3.73337 2.74408 3.57709C2.90036 3.42081 3.11232 3.33301 3.33333 3.33301H16.6667C16.8877 3.33301 17.0996 3.42081 17.2559 3.57709C17.4122 3.73337 17.5 3.94533 17.5 4.16634V12.4997C17.5 12.7207 17.4122 12.9326 17.2559 13.0889C17.0996 13.2452 16.8877 13.333 16.6667 13.333H3.33333C3.11232 13.333 2.90036 13.2452 2.74408 13.0889C2.5878 12.9326 2.5 12.7207 2.5 12.4997V4.16634Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
