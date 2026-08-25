import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ImageUploadRoundIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="currentFill"
    className={className}
  >
    <path
      d="M6.56412 15.7486C6.07474 11.7423 11.6527 9.74726 15.7493 9.49917M15.75 6.0176V11.9817C15.75 14.1913 14.3679 15.75 12.1595 15.75H5.83322C3.6248 15.75 2.25 14.1913 2.25 11.9817V6.0176C2.25 3.80797 3.63209 2.25 5.83322 2.25H12.1595C14.3679 2.25 15.75 3.80797 15.75 6.0176ZM8.12164 7.33132C8.12164 8.03436 7.55215 8.60483 6.84883 8.60483C6.1462 8.60483 5.57671 8.03436 5.57671 7.33132C5.57671 6.62757 6.1462 6.05778 6.84883 6.05778C7.55215 6.05778 8.12164 6.62757 8.12164 7.33132Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
