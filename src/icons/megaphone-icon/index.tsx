import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MegaphoneIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    className={className}
  >
    <path
      d="M4.80769 11.9189V14.2421C4.80769 15.581 5.84088 16.6663 7.11538 16.6663C8.38989 16.6663 9.42308 15.581 9.42308 14.2421V13.3331M2.5 10.3027V8.48452C2.5 7.94581 2.83846 7.47172 3.33077 7.32089L16.2077 3.37543C16.2995 3.34729 16.3947 3.33301 16.4904 3.33301C17.0479 3.33301 17.5 3.80786 17.5 4.39361V14.3936C17.5 14.9793 17.0479 15.4542 16.4904 15.4542C16.3947 15.4542 16.2995 15.4399 16.2077 15.4118L3.33077 11.4663C2.83846 11.3155 2.5 10.8414 2.5 10.3027Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
