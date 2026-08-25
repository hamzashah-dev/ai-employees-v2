import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const BookIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
    >
      <path
        d="M13.3334 14H4.12129C3.73553 14 3.36555 13.8542 3.09277 13.5945C2.82 13.3348 2.66675 12.9826 2.66675 12.6154C2.66675 12.2482 2.82 11.8959 3.09277 11.6363C3.36555 11.3766 3.73553 11.2308 4.12129 11.2308H12.3637M12.3637 11.2308C12.6209 11.2308 12.8676 11.1335 13.0494 10.9604C13.2312 10.7873 13.3334 10.5525 13.3334 10.3077V2.92308C13.3334 2.67826 13.2312 2.44347 13.0494 2.27036C12.8676 2.09725 12.6209 2 12.3637 2H4.12129C3.74215 1.99987 3.37794 2.14067 3.10625 2.3924C2.83455 2.64414 2.67686 2.98691 2.66675 3.34769V12.5785M12.3637 11.2308L12.3637 14"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
