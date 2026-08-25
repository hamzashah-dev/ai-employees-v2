import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const GoogleMeetIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg fill="none" viewBox="0 0 14 11" className={className}>
    <path
      fill="#00832d"
      d="m7.542 5.333 1.3 1.445 1.748 1.086.304-2.522-.304-2.464-1.781.954z"
    />
    <path
      fill="#0066da"
      d="M0 7.63v2.148c0 .49.41.889.914.889h2.21l.458-1.624-.458-1.414-1.516-.445z"
    />
    <path fill="#e94235" d="M3.124 0 0 3.038l1.608.443 1.516-.443.45-1.395z" />
    <path fill="#2684fc" d="M0 7.63h3.124V3.038H0z" />
    <path
      fill="#00ac47"
      d="M12.586 1.286 10.59 2.878v4.986l2.005 1.598c.3.228.738.02.738-.35V1.63c0-.375-.449-.583-.747-.344"
    />
    <path
      fill="#00ac47"
      d="M7.542 5.333V7.63H3.125v3.038h6.552a.9.9 0 0 0 .915-.89V7.865z"
    />
    <path
      fill="#ffba00"
      d="M9.676 0H3.124v3.038h4.419v2.295l3.047-2.455V.889A.9.9 0 0 0 9.676 0"
    />
  </svg>
);
