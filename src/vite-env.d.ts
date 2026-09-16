/// <reference types="vite/client" />

/**
 * The `VITE_*` surface this app reads.
 *
 * Only `VITE_HERMES_TARGET` is consumed by client code — the URL and the
 * expected COMPUTER_HOME are dev-server concerns and never reach the bundle.
 * `vite.config.ts` always `define`s the target, so it is present even when
 * `.env` leaves it out and the config derives it from the URL instead.
 */
interface ImportMetaEnv {
  readonly VITE_HERMES_TARGET?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * The installable agent packs, generated at build time from `<repo>/agents/`
 * by the `hermes:agent-packs` plugin in `build/agent-packs/`.
 *
 * `AgentPack` is declared here rather than in the plugin because this file has
 * to stay a global script — the moment it takes a top-level import it becomes a
 * module and this ambient declaration stops registering. So the contract lives
 * at the consumer's end and the plugin imports it back as a type, which keeps
 * one definition instead of two that can drift.
 */
declare module 'virtual:agent-packs' {
  export interface AgentPack {
    id: string
    /** `distribution.yaml`'s `name`, which is the Hermes profile slug. */
    name: string
    description: string
    version: string
    author: string
    /** Where the browser fetches the tarball. Stable, so no asset hashing dance. */
    url: string
    /** Compressed size, for the install UI to say what it is about to transfer. */
    bytes: number
    /**
     * `YYYY-MM-DD` of the newest file in the pack's source directory.
     *
     * A real date, so a pack with no authored catalog entry can still be sorted
     * by "Newest" without anyone inventing one for it.
     */
    updatedAt: string
    /**
     * `env_requires` from the manifest. Carried so a card can say what a pack
     * will ask for — nothing here installs or writes them.
     */
    envRequires: { name: string; description: string; required: boolean }[]
  }

  export const AGENT_PACKS: AgentPack[]
}
