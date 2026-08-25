import type { PropsWithClassName } from '@repo/types/common';

export const MealIcon = ({ className }: PropsWithClassName) => (
  <svg
    width="24"
    height="24"
    fill="none"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M3.094 13.669c.462.325.887.673 1.8.673 1.718 0 1.718-1.227 3.436-1.227 1.719 0 1.719 1.227 3.425 1.227 1.718 0 1.718-1.227 3.437-1.227s1.718 1.227 3.436 1.227c.864 0 1.299-.306 1.731-.613m-8.55-7.342h-.082m3.85 1.412h-.082m-7.45 0h-.081m10.655 2.87c1.12 0 1.96-.91 1.69-1.854C19.353 5.476 15.873 3 11.727 3S4.1 5.476 3.144 8.815c-.269.943.57 1.854 1.69 1.854zM17.211 21H6.788a3.695 3.695 0 0 1-3.694-3.695c0-.286.23-.517.517-.517h16.778c.285 0 .517.231.517.517A3.695 3.695 0 0 1 17.21 21"
    />
  </svg>
);
