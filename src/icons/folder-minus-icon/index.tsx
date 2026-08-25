import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const FolderMinusIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M7.68421 11.7779H3.26316C2.92815 11.7779 2.60686 11.6453 2.36997 11.4091C2.13308 11.173 2 10.8527 2 10.5187V3.59276C2 3.25878 2.13308 2.93848 2.36997 2.70232C2.60686 2.46617 2.92815 2.3335 3.26316 2.3335H5.78947L7.68421 4.22238H12.1053C12.4403 4.22238 12.7616 4.35506 12.9985 4.59121C13.2353 4.82737 13.3684 5.14767 13.3684 5.48164V7.68535M10.2105 11.7779H14"
        stroke="currentColor"
        strokeWidth="currentStroke"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
