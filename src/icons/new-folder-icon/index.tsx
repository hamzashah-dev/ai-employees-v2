import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const NewFolderIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
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
        d="M7.684 11.778h-4.42A1.265 1.265 0 0 1 2 10.52V3.593a1.257 1.257 0 0 1 1.263-1.259H5.79l1.895 1.889h4.421a1.265 1.265 0 0 1 1.263 1.26v2.203m-3.158 4.092H14M12.105 9.89v3.777"
      />
    </svg>
  );
};
