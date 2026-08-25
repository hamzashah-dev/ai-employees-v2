import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AiVariateIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M8.98723 3.90093H12.1538C13.1735 3.90093 14 4.75205 14 5.80196V10.1979C14 11.2479 13.1735 12.099 12.1538 12.099H10.3077M9.84613 2L7.99997 3.90104L9.84613 5.80207M6.91026 12.0988H3.84616C2.82655 12.0988 2 11.2477 2 10.1977L2.00002 5.80207C2.00002 4.75216 2.82657 3.90104 3.84618 3.90104H5.69234M6.15397 14L8.00014 12.099L6.15397 10.1979"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
