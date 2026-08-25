import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingPinIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 11 11" className={className}>
    <path
      stroke="currentColor"
      d="M2.907 7.593.75 9.75M5.329.997l-.333.333a.85.85 0 0 0-.185.917l.008.02a.84.84 0 0 1-.183.916l-.752.752a.85.85 0 0 1-.345.209L1.761 4.7a.844.844 0 0 0-.344 1.402l2.981 2.982A.844.844 0 0 0 5.8 8.74l.557-1.78a.84.84 0 0 1 .209-.344l.752-.751a.84.84 0 0 1 .917-.185l.019.008c.315.13.676.057.917-.183l.333-.333a.844.844 0 0 0 0-1.194L6.522.997a.843.843 0 0 0-1.193 0Z"
    />
  </svg>
);
