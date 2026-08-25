import type { PropsWithClassName } from '@repo/types/common';

import type { FC } from 'react';

export const AiGearIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="20"
    height="20"
    fill="none"
    viewBox="0 0 20 20"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M9.211 4.099h-.504a.97.97 0 0 0-.9.619L7.393 5.79l-1.43.812-1.141-.174a.97.97 0 0 0-.967.473l-.387.677a.97.97 0 0 0 .078 1.092l.725.9v1.624l-.706.899a.97.97 0 0 0-.077 1.092l.386.677a.97.97 0 0 0 .967.473l1.14-.174 1.412.812.416 1.073a.97.97 0 0 0 .899.619h.812a.97.97 0 0 0 .899-.619l.416-1.073 1.411-.812 1.14.174a.97.97 0 0 0 .967-.473l.387-.677a.97.97 0 0 0-.077-1.092l-.725-.9v-.47m-6.767-.342a1.934 1.934 0 1 0 3.867 0 1.934 1.934 0 0 0-3.867 0m4.252-4.749c-.4-.07-.4-.652 0-.723a3.64 3.64 0 0 0 2.906-2.83l.024-.112a.376.376 0 0 1 .737-.003l.03.13a3.65 3.65 0 0 0 2.914 2.813c.401.071.401.656 0 .727A3.65 3.65 0 0 0 15.12 8.45l-.03.13c-.09.4-.65.397-.737-.003l-.024-.112a3.64 3.64 0 0 0-2.906-2.83"
    />
  </svg>
);
