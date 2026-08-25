import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const WeatherPartlyCloudyDarkIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="136"
    height="136"
    viewBox="0 0 136 136"
    fill="none"
    className={className}
  >
    <rect x="60" y="100" width="76" height="29" rx="14.5" fill="#D0D8FF" />
    <rect x="60" y="100" width="76" height="29" rx="14.5" fill="#545A78" />
    <rect x="9" y="29" width="44" height="44" rx="22" fill="white" />
    <rect x="9" y="29" width="44" height="44" rx="22" fill="#5C70A5" />
    <circle
      cx="74"
      cy="63"
      r="45.5"
      fill="white"
      stroke="#E2E2E2"
      strokeWidth="5"
    />
    <path
      d="M95 81C108.255 81 119 91.7452 119 105C119 115.823 111.835 124.971 101.99 127.964C100.324 128.631 98.5061 129 96.6016 129H57.6016C49.5934 129 43.1016 122.508 43.1016 114.5C43.1016 106.492 49.5934 100 57.6016 100H71.5225C73.8229 89.1451 83.4598 81 95 81Z"
      fill="white"
    />
    <path
      d="M95 81C108.255 81 119 91.7452 119 105C119 115.823 111.835 124.971 101.99 127.964C100.324 128.631 98.5061 129 96.6016 129H57.6016C49.5934 129 43.1016 122.508 43.1016 114.5C43.1016 106.492 49.5934 100 57.6016 100H71.5225C73.8229 89.1451 83.4598 81 95 81Z"
      fill="#5C70A5"
    />
  </svg>
);

export const WeatherPartlyCloudyLightIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="136"
    height="136"
    viewBox="0 0 136 136"
    fill="none"
    className={className}
  >
    <rect x="60" y="100" width="76" height="29" rx="14.5" fill="#D0D8FF" />
    <rect x="9" y="29" width="44" height="44" rx="22" fill="white" />
    <circle
      cx="74"
      cy="63"
      r="45.5"
      fill="#FFCE26"
      stroke="#E5B468"
      strokeWidth="5"
    />
    <path
      d="M95 81C108.255 81 119 91.7452 119 105C119 115.823 111.835 124.971 101.99 127.964C100.324 128.631 98.5061 129 96.6016 129H57.6016C49.5934 129 43.1016 122.508 43.1016 114.5C43.1016 106.492 49.5934 100 57.6016 100H71.5225C73.8229 89.1451 83.4598 81 95 81Z"
      fill="white"
    />
  </svg>
);
