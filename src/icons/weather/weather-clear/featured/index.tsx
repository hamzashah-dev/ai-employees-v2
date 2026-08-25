import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const WeatherClearDarkIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="136"
    height="136"
    viewBox="0 0 136 136"
    fill="none"
    className={className}
  >
    <circle
      cx="74"
      cy="63"
      r="45.5"
      fill="white"
      stroke="#E2E2E2"
      strokeWidth="5"
    />
  </svg>
);

export const WeatherClearLightIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="136"
    height="136"
    viewBox="0 0 136 136"
    fill="none"
    className={className}
  >
    <circle
      cx="74"
      cy="63"
      r="45.5"
      fill="#FFCE26"
      stroke="#E5B468"
      strokeWidth="5"
    />
  </svg>
);
