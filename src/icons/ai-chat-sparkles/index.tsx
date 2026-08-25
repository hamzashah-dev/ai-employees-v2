import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AiChatSparklesIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M7.01356 13.9019C6.36154 13.793 5.72804 13.5736 5.13473 13.251L2 14L2.86705 11.0789C1.31703 8.50453 1.91596 5.18269 4.26767 3.30867C6.61939 1.4354 9.99689 1.58895 12.1679 3.66819C13.279 4.73253 13.898 6.13243 14 7.57052M12.125 10.25L12.198 10.4472C12.4731 11.1907 13.0593 11.7769 13.8029 12.052L14 12.125L13.8029 12.1979C13.0593 12.4731 12.4731 13.0593 12.198 13.8028L12.125 14L12.052 13.8028C11.7769 13.0593 11.1907 12.4731 10.4472 12.1979L10.25 12.125L10.4472 12.052C11.1907 11.7769 11.7769 11.1907 12.052 10.4472L12.125 10.25Z"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
