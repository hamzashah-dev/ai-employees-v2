import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FileDownloadIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg height="18" viewBox="0 0 18 18" fill="none" className={className}>
    <path
      d="M2.25 12.3279V13.3436C2.25 13.8822 2.4687 14.3987 2.85803 14.7796C3.24735 15.1606 3.77543 15.3747 4.32617 15.375H13.6727C13.9455 15.375 14.2157 15.3225 14.4677 15.2204C14.7197 15.1183 14.9487 14.9687 15.1416 14.78C15.3345 14.5914 15.4875 14.3675 15.5919 14.121C15.6963 13.8745 15.75 13.6104 15.75 13.3436V12.329M12.4047 7.81349C11.7243 9.14319 10.3624 10.475 9.0005 11.1415C7.6386 10.475 6.27669 9.14425 5.5952 7.81136M8.99944 2.625V11.1051"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
