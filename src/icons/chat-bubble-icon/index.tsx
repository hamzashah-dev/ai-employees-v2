import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ChatBubbleIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      fill="#516bff"
      d="M0 4a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v8a4 4 0 0 1-4 4H4a4 4 0 0 1-4-4z"
    />
    <path
      fill="#d9d9d9"
      d="M13 8a5 5 0 1 0-9.339 2.486c-.22.574-.427 1.243-.56 1.91a.41.41 0 0 0 .5.482 16 16 0 0 0 1.857-.571A5 5 0 0 0 13 8"
    />
    <path
      fill="#fff"
      d="M13 8a5 5 0 1 0-9.339 2.486c-.22.574-.427 1.243-.56 1.91a.41.41 0 0 0 .5.482 16 16 0 0 0 1.857-.571A5 5 0 0 0 13 8"
    />
  </svg>
);
