import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import yaml from 'js-yaml'
import type { Plugin } from 'vite'
// The shape this plugin emits is declared where it is consumed, in
// src/vite-env.d.ts — see the note there on why it cannot live here.
import type { AgentPack } from 'virtual:agent-packs'

/**
 * Packs the installable agents in `<repo>/agents/` for the browser to install.
 *
 * Hermes can only import a profile from a `.tar.gz` **already on its own
 * filesystem** (`ProfileImport.archive` is a backend path, not an upload), and
 * the cloud VM has no checkout of this repo. So a hire is three calls — upload
 * the pack, then import it by the path it landed at — and something has to put
 * the bytes in the browser's hands first. That is this plugin: it tars each
 * pack at build time into `public/agent-packs/` and describes them through the
 * `virtual:agent-packs` module the catalog reads.
 *
 * Build time rather than runtime because the browser cannot read the developer's
 * disk, and the app has to keep working when the dashboard serves the built
 * bundle rather than Vite.
 */

const VIRTUAL_ID = 'virtual:agent-packs'
const RESOLVED_ID = '\0virtual:agent-packs'

/** Where the packs are served from, in dev and in the built bundle alike. */
const PUBLIC_DIR = 'agent-packs'

/**
 * Never shipped, whatever `distribution_owned` says.
 *
 * `.env` files hold live keys; a pack is a public artefact served to any browser
 * that can reach the app. `memories/` and `workspace/` are the agent's own
 * accumulated state rather than its definition, and `tests/` is development
 * tooling that means nothing on the target machine.
 */
const NEVER_PACK = ['.env', '.env.*', 'memories', 'workspace', 'tests', '.git', 'node_modules', '__pycache__']

interface DistributionYaml {
  name?: string
  version?: string
  description?: string
  author?: string
  distribution_owned?: string[]
  env_requires?: { name?: string; description?: string; required?: boolean }[]
}

function readDistribution(dir: string): DistributionYaml | undefined {
  const file = path.join(dir, 'distribution.yaml')
  if (!fs.existsSync(file)) return undefined
  const parsed = yaml.load(fs.readFileSync(file, 'utf8'))
  return typeof parsed === 'object' && parsed !== null ? (parsed as DistributionYaml) : undefined
}

/** Newest mtime anywhere under `dir`, so a pack is only rebuilt when it changed. */
function newestMtime(dir: string): number {
  let newest = 0
  for (const entry of fs.readdirSync(dir, { withFileTypes: true, recursive: true })) {
    const parent = (entry as fs.Dirent & { parentPath?: string }).parentPath ?? dir
    try {
      const { mtimeMs } = fs.statSync(path.join(parent, entry.name))
      if (mtimeMs > newest) newest = mtimeMs
    } catch {
      // A symlink to nowhere, or a file that vanished mid-scan. Neither should
      // stop a build; the worst case is a pack that rebuilds when it need not.
    }
  }
  return newest
}

/**
 * Tar one agent so the archive has exactly one top-level directory named for
 * the agent — `import_profile` rejects anything else, and infers the profile
 * name from it.
 *
 * Shells out to the system `tar`. The alternative is hand-rolling the format,
 * and these packs carry paths past tar's 100-byte name field
 * (`seo-agent/skills/marketing/site-audit/scripts/seoengine/…`), so a
 * hand-rolled writer would need PAX extensions to be correct.
 */
function writePack(agentsDir: string, id: string, owned: string[] | undefined, out: string): void {
  const members = owned?.length
    ? owned.filter((entry) => fs.existsSync(path.join(agentsDir, id, entry))).map((entry) => `${id}/${entry}`)
    : [id]

  execFileSync(
    'tar',
    ['czf', out, '-C', agentsDir, ...NEVER_PACK.flatMap((pattern) => ['--exclude', pattern]), ...members],
    {
      // macOS bsdtar otherwise folds extended attributes into `._*` members,
      // which land in the imported profile as junk files.
      env: { ...process.env, COPYFILE_DISABLE: '1' },
      stdio: ['ignore', 'ignore', 'pipe'],
    },
  )
}

export function agentPacks(options: { agentsDir: string }): Plugin {
  const { agentsDir } = options
  let packs: AgentPack[] = []

  return {
    name: 'hermes:agent-packs',

    /*
     * `configResolved`, not `buildStart`. Vite builds its static-file
     * middleware from `publicDir` while the server is being created, which is
     * after `buildStart` — so packs written there are missing for the life of
     * that dev server and every fetch falls through to the SPA's index.html.
     * Writing them during config resolution means they exist before anything
     * looks. (Observed, not theorised: the first run served HTML for a
     * .tar.gz and only worked after a restart.)
     */
    configResolved() {
      if (!fs.existsSync(agentsDir)) {
        console.warn(
          `[agent-packs] No agents directory at ${agentsDir}. The marketplace will render an ` +
            `empty shelf rather than offering agents that cannot be installed. ` +
            `Set VITE_AGENTS_DIR if the checkout lives elsewhere.`,
        )
        packs = []
        return
      }

      const outDir = path.resolve('public', PUBLIC_DIR)
      fs.mkdirSync(outDir, { recursive: true })

      const built: AgentPack[] = []
      for (const entry of fs.readdirSync(agentsDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue

        const dir = path.join(agentsDir, entry.name)
        const dist = readDistribution(dir)
        // A directory with no distribution.yaml is not a distributable pack —
        // `computer profile install` reads that file, so without it there is
        // nothing to install even though the folder looks the part.
        if (!dist) continue

        const id = entry.name
        const out = path.join(outDir, `${id}.tar.gz`)
        const touched = newestMtime(dir)
        const stale = !fs.existsSync(out) || fs.statSync(out).mtimeMs < touched
        if (stale) writePack(agentsDir, id, dist.distribution_owned, out)

        built.push({
          id,
          name: dist.name ?? id,
          description: (dist.description ?? '').trim(),
          version: dist.version ?? '0.0.0',
          author: dist.author ?? '',
          url: `/${PUBLIC_DIR}/${id}.tar.gz`,
          bytes: fs.statSync(out).size,
          updatedAt: new Date(touched).toISOString().slice(0, 10),
          envRequires: (dist.env_requires ?? []).map((req) => ({
            name: req.name ?? '',
            description: (req.description ?? '').trim(),
            required: req.required === true,
          })),
        })
      }

      packs = built.sort((a, b) => a.id.localeCompare(b.id))
      console.info(
        `[agent-packs] ${packs.length} installable ${packs.length === 1 ? 'pack' : 'packs'}: ` +
          packs.map((pack) => pack.id).join(', '),
      )
    },

    resolveId(id: string) {
      return id === VIRTUAL_ID ? RESOLVED_ID : undefined
    },

    load(id: string) {
      if (id !== RESOLVED_ID) return undefined
      return `export const AGENT_PACKS = ${JSON.stringify(packs, null, 2)}\n`
    },
  }
}
