import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FacebookInvertIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
    >
      <rect width="18" height="18" rx="9" fill="white" />
      <path
        d="M12.3376 2.25H10.3126C9.41749 2.25 8.55905 2.60558 7.92611 3.23851C7.29318 3.87145 6.9376 4.72989 6.9376 5.625V7.65H4.9126V10.35H6.9376V15.75H9.6376V10.35H11.6626L12.3376 7.65H9.6376V5.625C9.6376 5.44598 9.70871 5.27429 9.8353 5.1477C9.96189 5.02112 10.1336 4.95 10.3126 4.95H12.3376V2.25Z"
        fill="#0088FF"
      />
    </svg>
  );
};
