import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const WeatherCloudyDarkIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="136"
    height="136"
    viewBox="0 0 136 136"
    fill="none"
    className={className}
  >
    <rect x="52" y="52" width="82" height="48" rx="24" fill="#D0D8FF" />
    <rect x="52" y="52" width="82" height="48" rx="24" fill="#545A78" />
    <path
      d="M66 20C88.0914 20 106 37.9086 106 60C106 82.0914 88.0914 100 66 100C65.5033 100 65.0089 99.9877 64.5166 99.9697C64.1802 99.989 63.8413 100 63.5 100H19.5C9.83502 100 2 92.165 2 82.5C2 72.835 9.83502 65 19.5 65H26.3105C26.1063 63.362 26 61.6933 26 60C26 37.9086 43.9086 20 66 20Z"
      fill="white"
    />
    <path
      d="M66 20C88.0914 20 106 37.9086 106 60C106 82.0914 88.0914 100 66 100C65.5033 100 65.0089 99.9877 64.5166 99.9697C64.1802 99.989 63.8413 100 63.5 100H19.5C9.83502 100 2 92.165 2 82.5C2 72.835 9.83502 65 19.5 65H26.3105C26.1063 63.362 26 61.6933 26 60C26 37.9086 43.9086 20 66 20Z"
      fill="#5C70A5"
    />
  </svg>
);

export const WeatherCloudyLightIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="136"
    height="136"
    viewBox="0 0 136 136"
    fill="none"
    className={className}
  >
    <rect x="52" y="52" width="82" height="48" rx="24" fill="#D0D8FF" />
    <path
      d="M66 20C88.0914 20 106 37.9086 106 60C106 82.0914 88.0914 100 66 100C65.5033 100 65.0089 99.9877 64.5166 99.9697C64.1802 99.989 63.8413 100 63.5 100H19.5C9.83502 100 2 92.165 2 82.5C2 72.835 9.83502 65 19.5 65H26.3105C26.1063 63.362 26 61.6933 26 60C26 37.9086 43.9086 20 66 20Z"
      fill="white"
    />
  </svg>
);
