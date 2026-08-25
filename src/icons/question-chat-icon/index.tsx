import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const QuestionChatIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="18"
    height="18"
    fill="none"
    viewBox="0 0 18 18"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="m8.832 11.885.004.026m-.004-1.706c-.008-.614.55-.873.965-1.11.506-.28.85-.724.85-1.34 0-.912-.74-1.645-1.646-1.645a1.64 1.64 0 0 0-1.646 1.645m-1.323 7.31a6.75 6.75 0 1 0-3.096-3.096c.388.806.016 1.69-.18 2.5-.112.443.332.887.776.775.808-.204 1.692-.568 2.5-.18Z"
    />
  </svg>
);
