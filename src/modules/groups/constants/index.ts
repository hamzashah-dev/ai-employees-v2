/**
 * Presentation constants for the group surfaces.
 *
 * The room *engine*'s constants — round caps, timeouts, the pass text, the member
 * bounds — live in `core/constants/groups` because the sidebar reads them too.
 * What is left here is the styling this module repeats and nobody else needs.
 */

/**
 * `@repo/ui` ships no input primitive — there is not one `<input>` in the whole
 * package — so every field in this module is hand-rolled against the token layer,
 * the same way `LoginRequest`'s is, with the button's focus treatment so a field
 * and a button focus alike.
 */
export const GROUP_FIELD =
  'h-10 w-full rounded-xl border border-primary bg-fill-elevated px-3 text-label-md text-primary outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 placeholder:text-tertiary'
