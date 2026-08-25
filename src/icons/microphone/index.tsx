import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MicrophoneIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M9.58398 15.1923V17.5M9.58398 15.1923C6.13221 15.1923 3.33398 12.351 3.33398 8.84614M9.58398 15.1923C13.0358 15.1923 15.834 12.351 15.834 8.84614M12.9934 8.84613V5.96156C12.9934 4.04979 11.4671 2.5 9.58427 2.5C7.70147 2.5 6.17517 4.04979 6.17517 5.96156V8.84613C6.17517 10.7579 7.70147 12.3077 9.58427 12.3077C11.4671 12.3077 12.9934 10.7579 12.9934 8.84613Z"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
