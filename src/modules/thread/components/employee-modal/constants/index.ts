/**
 * The employee's scratch directory, relative to `HermesProfile.path`.
 *
 * `_PROFILE_DIRS` in `computer_cli/profiles.py` bootstraps `workspace/` into every profile
 * it creates, alongside `memories`, `sessions`, `skills` and `logs`. It is the only
 * per-employee directory that is *for* the employee's output rather than for Hermes' own
 * machinery, which is why the modal lists it rather than the profile root — the root is
 * `config.yaml`, `state.db`, `SOUL.md` and a dozen caches, none of which are "files".
 *
 * The `default` profile predates the bootstrap and has no `workspace/` at all, so a 404 is
 * an expected answer here, not an error. See `use-workspace-files`.
 */
export const WORKSPACE_DIR = 'workspace'

/** How many file rows show before "See all". Enough to fill the section without scrolling it. */
export const VISIBLE_FILES = 5
