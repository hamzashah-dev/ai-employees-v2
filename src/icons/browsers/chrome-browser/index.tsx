import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ChromeBrowserIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="48"
      height="48"
      viewBox="0 0 48 48"
      fill="none"
      className={className}
    >
      <g clipPath="url(#clip0_7615_522433)">
        <path
          d="M3.209 36.013A23.968 23.968 0 0 0 21.93 47.915l10.87-18.826L24 24.009l-8.795 5.077L4.34 10.266a23.991 23.991 0 0 0-1.13 25.747Z"
          fill="#00AC47"
        />
        <path
          d="M24 0A23.969 23.969 0 0 0 4.33 10.263L15.2 29.089l8.8-5.08V13.853h21.732A23.993 23.993 0 0 0 24 0Z"
          fill="#EA4435"
        />
        <path
          d="M44.79 36.013a23.969 23.969 0 0 0 .946-22.164H23.997v10.16l8.796 5.078-10.867 18.822A23.993 23.993 0 0 0 44.79 36.013Z"
          fill="#FFBA00"
        />
        <path
          d="M23.999 34.17c5.61 0 10.159-4.548 10.159-10.159 0-5.61-4.548-10.158-10.158-10.158-5.61 0-10.16 4.548-10.16 10.158 0 5.61 4.549 10.159 10.159 10.159Z"
          fill="#fff"
        />
        <path
          d="M23.999 31.861a7.85 7.85 0 1 0 0-15.7 7.85 7.85 0 0 0 0 15.7Z"
          fill="#4285F4"
        />
      </g>
      <defs>
        <clipPath id="clip0_7615_522433">
          <path fill="#fff" d="M0 0h48v48H0z" />
        </clipPath>
      </defs>
    </svg>
  );
};
