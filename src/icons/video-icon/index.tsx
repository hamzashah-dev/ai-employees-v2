import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const VideoIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="24"
    height="24"
    fill="none"
    className={className}
    viewBox="0 0 24 24"
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M21 8.027v7.953c0 2.946-1.843 5.024-4.788 5.024H7.778C4.833 21.004 3 18.926 3 15.979V8.028c0-2.946 1.843-5.023 4.778-5.023h8.434C19.157 3.004 21 5.08 21 8.027"
      clipRule="evenodd"
    />
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M14.674 13.066a9.6 9.6 0 0 1-2.8 1.757c-.905.356-1.662-.088-1.774-.979a17.5 17.5 0 0 1 0-3.746c.122-.925.957-1.32 1.773-.975a9.4 9.4 0 0 1 2.801 1.758c.697.631.714 1.528 0 2.185"
      clipRule="evenodd"
    />
  </svg>
);
