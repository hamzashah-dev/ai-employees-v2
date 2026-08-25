import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageStarIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M8.252 2H5.188C3.228 2 2 3.387 2 5.35v5.3C2 12.612 3.223 14 5.188 14h5.623C12.777 14 14 12.613 14 10.65V7.296M9.205 5.85h.006m-4.556 4.898 1.793-2.912a.475.475 0 0 1 .792-.027l1.12 1.575c.18.252.55.268.75.032l.402-.472a.476.476 0 0 1 .768.06l1.067 1.745a.475.475 0 0 1-.406.724H5.06a.475.475 0 0 1-.404-.725Zm7.423-4.898.075-.203A2.787 2.787 0 0 1 13.798 4L14 3.925l-.202-.075a2.787 2.787 0 0 1-1.645-1.648L12.078 2l-.075.202a2.787 2.787 0 0 1-1.645 1.648l-.202.075.202.075a2.787 2.787 0 0 1 1.645 1.647l.075.203Z"
    />
  </svg>
);
