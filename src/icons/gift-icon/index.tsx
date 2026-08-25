import type { PropsWithClassName } from '@repo/types/common';

export const GiftIcon = ({ className }: PropsWithClassName) => (
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
      d="M12 20v-8M8.244 7.722c-1.522 0-2.68-3.722.5-3.722C10.696 4 12 6.606 12 7.722 12 6.606 13.303 4 15.257 4c3.18 0 2.021 3.722.5 3.722m3.277 10.945v-6.81H4.965v6.81c0 .736.597 1.333 1.334 1.333H17.7c.736 0 1.333-.597 1.333-1.333M20 9.056v1.467c0 .737-.597 1.334-1.333 1.334H5.333A1.333 1.333 0 0 1 4 10.523V9.056c0-.737.597-1.334 1.333-1.334h13.334c.736 0 1.333.597 1.333 1.334"
    />
  </svg>
);
