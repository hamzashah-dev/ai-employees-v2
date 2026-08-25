import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const Rocket2Icon: FC<PropsWithClassName> = ({ className }) => (
  <svg width="16" height="16" fill="none" className={className}>
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeOpacity="currentOpacity"
      d="m11.128 9.29-.223 3.127c0 .272-.153.52-.397.641l-1.736.866a.72.72 0 0 1-1.003-.414l-.812-1.98M6.74 4.915l-3.136.2a.72.72 0 0 0-.645.393l-.88 1.725a.715.715 0 0 0 .409 1.004l1.978.824m.255 3.535c-.192 1.27-1.682 1.033-2.654 1.179.146-.97-.083-2.449 1.19-2.64m5.76-5.903a1.144 1.144 0 0 1 1.614 0 1.14 1.14 0 0 1 .001 1.612 1.144 1.144 0 0 1-1.615 0 1.14 1.14 0 0 1 0-1.612m4.552-3.217c-3.861-.262-8.627 3.294-9.14 7.296-.011.35.117.68.356.92l.967.964c.24.24.571.367.922.355 4.011-.512 7.576-5.266 7.313-9.118a.443.443 0 0 0-.418-.417"
    />
  </svg>
);
