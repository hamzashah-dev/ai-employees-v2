import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const CircleDashedIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 15 15"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="0.5"
      strokeWidth="1.5"
      d="M8.955.924a6.9 6.9 0 0 0-3.077 0m-1.959.821a7.2 7.2 0 0 0-1.22.954 7.2 7.2 0 0 0-.954 1.22m-.82 1.96a6.9 6.9 0 0 0 0 3.076m.82 1.96q.411.661.954 1.22c.37.36.78.68 1.22.953m1.96.82a6.9 6.9 0 0 0 3.076 0m1.959-.82c.44-.272.85-.592 1.22-.953q.543-.559.954-1.22m.82-1.96a6.9 6.9 0 0 0 0-3.077m-.82-1.959a7.2 7.2 0 0 0-.954-1.22 7.2 7.2 0 0 0-1.22-.954"
    />
  </svg>
);
