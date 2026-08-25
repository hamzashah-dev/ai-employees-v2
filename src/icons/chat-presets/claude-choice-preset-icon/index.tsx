import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const ClaudeChoicePresetIcon: FC<PropsWithClassName> = ({
  className,
}) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    className={className}
  >
    <path
      stroke="#000"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M4.385 12.667H3m16.615 0H21M17.385 7.48l.979-.943M6.615 7.48l-.979-.943M12 5.333V4m0 3.667c-2.868 0-5.192 2.238-5.192 5 0 2.05 1.281 3.812 3.115 4.584v2.082c0 .369.31.667.692.667h2.77a.68.68 0 0 0 .692-.667v-2.082c1.834-.772 3.115-2.534 3.115-4.584 0-2.762-2.324-5-5.192-5"
    />
  </svg>
);
