import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const PauseIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    className={className}
    viewBox="0 0 18 18"
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="M3 2.925c0-.179.099-.35.275-.477.175-.127.414-.198.663-.198h1.874c.25 0 .488.071.663.198.176.126.275.298.275.477v12.15c0 .179-.099.35-.275.477a1.15 1.15 0 0 1-.662.198H3.938c-.25 0-.488-.071-.663-.198-.176-.126-.275-.298-.275-.477zm7.5 0c0-.179.099-.35.275-.477.175-.127.414-.198.662-.198h1.876c.248 0 .487.071.662.198.176.126.275.298.275.477v12.15c0 .179-.099.35-.275.477a1.15 1.15 0 0 1-.662.198h-1.876c-.248 0-.487-.071-.662-.198-.176-.126-.275-.298-.275-.477z"
      clipRule="evenodd"
    />
  </svg>
);
