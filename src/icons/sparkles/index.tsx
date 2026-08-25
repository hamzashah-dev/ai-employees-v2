import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const SparklesIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="m7.84 7.115 2.638-.96.96-2.638a.577.577 0 0 1 1.084 0l.96 2.639 2.638.96c.507.183.507.9 0 1.084l-2.638.959-.96 2.639a.577.577 0 0 1-1.084 0l-.96-2.639-2.638-.96a.577.577 0 0 1 0-1.084Zm-5.96 5.262 1.95-.71.709-1.95a.577.577 0 0 1 1.084 0l.71 1.95 1.95.71c.506.184.506.9 0 1.084l-1.95.71-.71 1.95a.577.577 0 0 1-1.084 0l-.71-1.95-1.95-.71a.577.577 0 0 1 0-1.084Zm0-8.827 1.224-.446.446-1.224a.577.577 0 0 1 1.084 0l.446 1.224 1.224.446c.507.184.507.9 0 1.084L5.08 5.08l-.446 1.224a.577.577 0 0 1-1.084 0L3.104 5.08 1.88 4.634a.577.577 0 0 1 0-1.084Z"
    />
  </svg>
);
