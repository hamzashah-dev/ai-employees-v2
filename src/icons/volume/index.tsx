import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const VolumeIcon: FC<PropsWithClassName> = ({ className }) => {
  return (
    <svg
      width="16"
      height="16"
      fill="none"
      viewBox="0 0 16 16"
      className={className}
    >
      <path
        d="M13.0766 11.3939C13.6673 10.3694 13.9861 9.19754 14 7.99997C13.9861 6.80239 13.6673 5.63053 13.0766 4.60602M11.2342 6.54542C11.5552 6.95297 11.7199 7.47166 11.696 7.99997C11.7199 8.52828 11.5552 9.04696 11.2342 9.45451M4.30856 6.05499H2.92343C2.42047 6.05499 2 6.49786 2 7.02763V8.97292C2 9.5027 2.42047 9.94557 2.92343 9.94557H4.30856L7.45744 13.165C8.05333 13.5993 8.90956 13.142 8.92569 12.3772V3.62336C8.94299 2.85804 8.1381 2.40003 7.54055 2.83552L4.30856 6.05499Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
