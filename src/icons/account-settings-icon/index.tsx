import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

export const AccountSettingsIcon: FC<PropsWithClassName> = ({ className }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    className={className}
  >
    <path
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="currentStroke"
      d="M7.27 9.333H4.968c-.61 0-1.196.235-1.627.651a2.18 2.18 0 0 0-.675 1.572v1.11m7.081-2.483.531-.212m0-1.275-.531-.213m1.466-.69-.22-.512m.22 3.592-.22.514m1.54-3.594.221-.512m0 4.106-.22-.514m.934-2.177L14 8.483m-.532 1.488.532.213m-.4-.85c0 .92-.774 1.666-1.727 1.666s-1.726-.746-1.726-1.667c0-.92.773-1.666 1.726-1.666.954 0 1.726.746 1.726 1.666M8.995 4.888c0 1.227-1.03 2.222-2.302 2.222-1.27 0-2.301-.995-2.301-2.222s1.03-2.222 2.301-2.222 2.302.995 2.302 2.222"
    />
  </svg>
);
