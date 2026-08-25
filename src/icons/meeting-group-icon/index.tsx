import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const MeetingGroupIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="10"
    height="9"
    viewBox="0 0 10 9"
    fill="none"
    className={className}
  >
    <path
      d="M7.87446 5.73658C9.06478 5.98634 9.5 6.79598 9.5 7.47217M7.61088 1.60357C8.15275 1.78241 8.54357 2.30303 8.54137 2.91675C8.53912 3.50435 8.17661 4.00512 7.66804 4.19983M0.5 8.5C0.5 7.4457 1.31388 6.13309 3.65782 6.13309C6.00178 6.13309 6.81565 7.43605 6.81565 8.49095M5.67474 2.5626C5.67474 3.70205 4.77144 4.6252 3.65775 4.6252C2.54353 4.6252 1.64026 3.70205 1.64026 2.5626C1.64026 1.42314 2.54353 0.5 3.65775 0.5C4.77144 0.5 5.67474 1.42314 5.67474 2.5626Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
