import type { PropsWithClassName } from '@repo/types/common';
import type { FC } from 'react';

const RING_SIZE = 60;
const RING_STROKE = 5;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

interface ScoreRingIconProps extends PropsWithClassName {
  score?: number;
  ringClassName?: string;
}

export const ScoreRingIcon: FC<ScoreRingIconProps> = ({
  className,
  score = 0,
  ringClassName,
}) => (
  <svg
    width={RING_SIZE}
    height={RING_SIZE}
    viewBox={`0 0 ${RING_SIZE} ${RING_SIZE}`}
    fill="none"
    className={className}
  >
    <circle
      cx={RING_SIZE / 2}
      cy={RING_SIZE / 2}
      r={RING_RADIUS}
      stroke="currentColor"
      strokeWidth={RING_STROKE}
      opacity={0.2}
    />
    <circle
      cx={RING_SIZE / 2}
      cy={RING_SIZE / 2}
      r={RING_RADIUS}
      stroke="currentColor"
      strokeWidth={RING_STROKE}
      strokeLinecap="round"
      strokeDasharray={RING_CIRCUMFERENCE}
      strokeDashoffset={RING_CIRCUMFERENCE - (score / 100) * RING_CIRCUMFERENCE}
      className={ringClassName}
    />
  </svg>
);
