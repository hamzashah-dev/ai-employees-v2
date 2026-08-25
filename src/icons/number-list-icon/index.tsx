import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const NumberListIcon: FC<PropsWithClassName> = ({ className }) => {
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
        d="M3.985 9.385H2.186c0-.305.166-.59.444-.763l.988-.612a.746.746 0 0 0 .367-.63c0-.423-.384-.765-.85-.765-.391 0-.752.131-.949.539m.9-2.385V2v.077c0 .34-.305.615-.68.615m-.449 8.923a.787.787 0 0 1 .706-.384h.322c.446 0 .808.327.808.73a.727.727 0 0 1-.447.654m0 0c.265.12.447.368.447.654 0 .404-.362.731-.808.731h-.322a.788.788 0 0 1-.706-.385m1.389-1h-.26m4.081-8.769h6.123M7.167 8h6.123m-6.123 4.154h6.123"
      />
    </svg>
  );
};
