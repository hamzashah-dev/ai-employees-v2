import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const YoutubeIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="28"
    height="28"
    fill="none"
    viewBox="0 0 28 28"
    className={className}
  >
    <path
      fill="currentColor"
      fillRule="evenodd"
      d="m17.547 15.686-4.709 2.665a1.247 1.247 0 0 1-1.253-.02 1.218 1.218 0 0 1-.606-1.056v-5.331c0-.446.233-.849.623-1.072a1.23 1.23 0 0 1 1.239-.003l4.706 2.665a1.235 1.235 0 0 1 0 2.152Zm8.076-7.627a3.963 3.963 0 0 0-2.703-2.854c-2.266-.744-15.757-.702-17.825.044a3.898 3.898 0 0 0-2.704 2.805c-.759 2.207-.759 10.932-.011 13.115.371 1.332 1.413 2.386 2.673 2.734 1.11.4 5.07.598 9.008.598 3.913 0 7.805-.195 8.848-.585 1.34-.395 2.38-1.49 2.697-2.799.757-2.164.76-10.866.017-13.058Z"
      clipRule="evenodd"
    />
  </svg>
);
