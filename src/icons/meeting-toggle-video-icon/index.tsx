import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingToggleVideoIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg fill="none" viewBox="0 0 15 15" className={className}>
    <path
      stroke="currentColor"
      d="M11.01.625h2.076c.276 0 .54.13.735.36s.304.542.304.867v2.455m-13.5 0V1.852c0-.325.11-.637.304-.868a.97.97 0 0 1 .734-.359H3.74m7.27 13.5h2.076c.276 0 .54-.13.735-.36a1.35 1.35 0 0 0 .304-.867v-2.455m-13.5 0v2.455c0 .325.11.637.304.867.195.23.459.36.734.36H3.74"
    />
  </svg>
);
