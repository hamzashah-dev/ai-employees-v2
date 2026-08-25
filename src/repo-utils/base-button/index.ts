import { cva } from 'class-variance-authority';

export const buttonBase = cva(
  'flex cursor-pointer items-center font-medium justify-center text-center outline-none focus-visible:outline-none focus-visible:ring-0 disabled:shadow-none disabled:cursor-default disabled:pointer-events-none active:translate-y-[0.0625rem] active:transform translate-y-0 [transition:color_500ms,background-color_500ms,border-color_500ms,text-decoration-color_500ms,fill_500ms,stroke_500ms,box-shadow_500ms,outline-color_500ms,transform] font-medium'
);
