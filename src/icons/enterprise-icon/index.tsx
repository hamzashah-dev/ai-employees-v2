import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const EnterpriseIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M2.5 16.6667H17.5M3.65385 2.5V16.6667M11.7308 2.5V16.6667M16.3462 6.04167V16.6667M5.96154 5.45139H6.53846M5.96154 7.8125H6.53846M5.96154 10.1736H6.53846M8.84615 5.45139H9.42308M8.84615 7.8125H9.42308M8.84615 10.1736H9.42308M5.96154 16.6667V14.0104C5.96154 13.5217 6.34923 13.125 6.82692 13.125H8.55769C9.03538 13.125 9.42308 13.5217 9.42308 14.0104V16.6667M3.07692 2.5H12.3077M11.7308 6.04167H16.9231M14.0385 8.99306H14.0446V8.99935H14.0385V8.99306ZM14.0385 11.3542H14.0446V11.3605H14.0385V11.3542ZM14.0385 13.7153H14.0446V13.7216H14.0385V13.7153Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
