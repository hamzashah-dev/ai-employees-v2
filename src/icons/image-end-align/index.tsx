import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const ImageEndAlignIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      d="M14 12.6667V2M11.5755 11.1073V9.87054C11.5755 9.10415 10.8836 8.48292 10.0301 8.48292H3.54541C2.69185 8.48292 2 9.10415 2 9.87054V11.1073C2 11.8737 2.69185 12.4949 3.54541 12.4949H10.0301C10.8836 12.4949 11.5755 11.8737 11.5755 11.1073ZM11.5761 4.79624V3.55949C11.5761 2.79308 10.8843 2.17186 10.0307 2.17186H6.73813C5.88455 2.17186 5.19271 2.79308 5.19271 3.55949V4.79624C5.19271 5.56265 5.88455 6.18385 6.73813 6.18385H10.0307C10.8843 6.18385 11.5761 5.56265 11.5761 4.79624Z"
      stroke="currentColor"
      strokeWidth="currentStroke"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
