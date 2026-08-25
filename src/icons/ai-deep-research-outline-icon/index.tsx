import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AIDeepResearchOutlineIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 16 16"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M10.218 12.666 7.867 8.37l-2.351 4.296m2.35-4.296v4.28m-.468-7.082-2.443.856c-.659.23-.999.933-.759 1.567l.116.307c.24.634.969.962 1.628.73l2.442-.856m-4.344-.6-1.622.569a.603.603 0 0 0-.378.78c.12.316.482.479.81.364l1.623-.569m3.198-2.431c-.24-.635.1-1.337.759-1.568l3.843-1.347a.64.64 0 0 1 .814.366l.876 2.32a.605.605 0 0 1-.379.783L9.739 8.186c-.659.231-1.388-.096-1.628-.73z"
    />
  </svg>
);
