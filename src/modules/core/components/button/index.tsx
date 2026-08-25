import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes, FC } from 'react'
import { cn } from '../../utils/cn'

/**
 * The canvas has no transitions, gradients or transforms, so states are plain
 * colour swaps. Radius 16 on buttons, 999 on pills — its two button shapes.
 */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-medium select-none ' +
    'disabled:pointer-events-none disabled:opacity-40 [&>svg]:shrink-0',
  {
    variants: {
      variant: {
        primary:
          'bg-[rgb(var(--color-brand))] text-white hover:bg-[rgb(var(--color-brand)/0.85)]',
        neutral:
          'bg-[rgb(var(--color-ink-3))] text-[rgb(var(--color-ink-7))] hover:bg-[rgb(var(--color-ink-4))]',
        ghost:
          'bg-transparent text-[rgb(var(--color-ink-6))] hover:bg-[rgb(var(--color-ink-2))] hover:text-[rgb(var(--color-ink-7))]',
        outline:
          'border border-[rgb(var(--color-ink-3))] bg-transparent text-[rgb(var(--color-ink-7))] hover:bg-[rgb(var(--color-ink-2))]',
      },
      size: {
        sm: 'h-8 px-3 text-label-sm rounded-[12px] [&>svg]:size-4',
        md: 'h-10 px-4 text-label-md rounded-[16px] [&>svg]:size-[18px]',
        icon: 'size-8 rounded-[10px] [&>svg]:size-[18px]',
        pill: 'h-8 px-3.5 text-label-sm rounded-full [&>svg]:size-4',
      },
    },
    defaultVariants: { variant: 'neutral', size: 'md' },
  },
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button: FC<ButtonProps> = ({ className, variant, size, ...props }) => (
  <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
)
