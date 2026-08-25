import type { IconProps } from '@repo/icons/types';
import * as React from 'react';

import { useId } from 'react';

export const LinkPaymentIcon: React.FC<IconProps> = ({
  className,
  ...props
}) => {
  const clipId = useId();

  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      {...props}
    >
      <g clipPath={`url(#${clipId})`}>
        <path
          fill="#00d66f"
          d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10"
        />
        <path
          fill="#011e0f"
          d="M11.54 6H8.454c.6 2.508 2.352 4.652 4.544 6-2.196 1.348-3.944 3.492-4.544 6h3.084c.764-2.32 2.88-4.336 5.48-4.748v-2.508C14.415 10.337 12.3 8.32 11.54 6"
        />
      </g>
      <defs>
        <clipPath id={clipId}>
          <path fill="#fff" d="M2 2h20v20H2z" />
        </clipPath>
      </defs>
    </svg>
  );
};
