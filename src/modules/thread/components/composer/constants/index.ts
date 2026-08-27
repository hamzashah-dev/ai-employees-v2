/**
 * The prompt box's own chrome, copied from chatly-web.
 *
 * Upstream this is `promptBoxVariants({ variant: 'default' })` in
 * `modules/core/components/prompt-box/components/prompt-box-root/components/
 * prompt-box-inner/components/prompt-box-form/utils`. It is a `cva` there
 * because that box has five shapes (pill, card, anchor…); this app draws one,
 * so the surviving variant is kept as a plain string rather than a one-armed
 * `cva`. Keep it byte-faithful to the `default` arm — the two surfaces are
 * meant to be indistinguishable.
 */
export const PROMPT_BOX_CLASS =
  'group flex w-full flex-col gap-3 rounded-3xl border border-primary bg-fill-variant px-3 pt-3 pb-3 transition duration-500 focus:border-primary focus-visible:border-primary active:border-primary'

/**
 * The dock — the control row under the editor. Upstream `DockRoot` in its
 * stacked shape, which is the only one drawn here.
 */
export const DOCK_CLASS = 'flex w-full items-center justify-between gap-2'

/** Upstream `DockStart`, stacked. */
export const DOCK_START_CLASS = 'flex shrink-0 items-center gap-2'

/** Upstream `DockEnd`, stacked. */
export const DOCK_END_CLASS = 'flex w-full items-center justify-end gap-2'

/**
 * The editor well. Upstream splits this between `PromptBoxTipTap`'s wrapper and
 * the TipTap `editorProps.attributes.class`; with a textarea the two collapse
 * into one element, so the wrapper's height floor and the editor's type,
 * padding and scroll behaviour are merged here.
 */
export const EDITOR_WRAPPER_CLASS =
  'flex min-h-12 w-full items-center justify-center tablet:min-h-8'

export const EDITOR_CLASS =
  'scrollbar-minimal max-h-72 w-full cursor-text resize-none overflow-auto border-none bg-inherit px-2 py-1 text-markdown-body font-normal text-primary opacity-100 outline-hidden ring-0 transition-[max-height] duration-700 ease-in-out placeholder:text-tertiary disabled:text-disabled disabled:placeholder:text-tertiary-disabled'
