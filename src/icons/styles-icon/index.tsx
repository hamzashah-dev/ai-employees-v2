import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const StylesIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentcolor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M9.409 6.154c.52 0 .941-.413.941-.923a.933.933 0 0 0-.941-.923.933.933 0 0 0-.942.923c0 .51.422.923.942.923ZM5.642 10.77c.26 0 .47-.207.47-.462a.466.466 0 0 0-.47-.462c-.26 0-.471.207-.471.462s.21.461.47.461ZM5.642 7.538c.52 0 .942-.413.942-.923a.933.933 0 0 0-.942-.923.933.933 0 0 0-.942.923c0 .51.422.923.942.923Z"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M10.37 12.874a.912.912 0 0 0-.183-.496.94.94 0 0 0-.43-.316 1.878 1.878 0 0 1-1.021-.795 1.816 1.816 0 0 1 .39-2.367c.342-.284.776-.44 1.224-.438h1.761c.302 0 .6-.07.869-.206.268-.135.5-.332.674-.574a1.825 1.825 0 0 0 .237-1.685A6.002 6.002 0 0 0 11.99 3.35 6.183 6.183 0 0 0 8.96 2.057a6.234 6.234 0 0 0-3.273.438 6.098 6.098 0 0 0-2.564 2.041 5.9 5.9 0 0 0-.439 6.221 6.05 6.05 0 0 0 2.254 2.368 6.214 6.214 0 0 0 4.819.653.847.847 0 0 0 .478-.34.817.817 0 0 0 .134-.564Z"
    />
  </svg>
);
