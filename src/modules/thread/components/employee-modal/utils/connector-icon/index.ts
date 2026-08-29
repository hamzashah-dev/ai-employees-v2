import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { AnthropicIcon } from '@repo/icons/anthropic'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { DiscordIcon } from '@repo/icons/discord'
import { ExcalidrawIcon } from '@repo/icons/excalidraw-icon'
import { GmailColoredIcon } from '@repo/icons/gmail-colored'
import { GoogleCalendarIcon } from '@repo/icons/google-calendar-icon'
import { GoogleDriveIcon } from '@repo/icons/google-drive-icon'
import { GoogleMeetIcon } from '@repo/icons/google-meet-icon'
import { GoogleIcon } from '@repo/icons/google'
import { InstagramIcon } from '@repo/icons/instagram'
import { LinkedInIcon } from '@repo/icons/linkedin-icon'
import { MsTeamsIcon } from '@repo/icons/ms-teams-icon'
import { NotionIcon } from '@repo/icons/notion-icon'
import { OutlookColoredIcon } from '@repo/icons/outlook-colored'
import { RedditIcon } from '@repo/icons/reddit-icon'
import { SlackIcon } from '@repo/icons/slack-icon'
import { WhatsappIcon } from '@repo/icons/whatsapp-icon'
import { YoutubeIcon } from '@repo/icons/youtube'

/**
 * MCP server name → brand mark, for the brands `@repo/icons` actually ships.
 *
 * **Hermes serves no icon for a server.** `_mcp_server_summary` returns name, transport,
 * url, command, args, env, auth, enabled and tools — there is no logo and no vendor id to
 * look one up by. The name is therefore the only thing available to match on, which is why
 * this is a substring lookup rather than a field read, and why an unrecognised server keeps
 * the generic glyph instead of getting a guessed mark.
 *
 * Matching is on a normalised name, so `slack`, `slack-mcp`, `Slack MCP` and
 * `mcp-server-slack` all land on the same entry. Order matters: the first key found in the
 * name wins, so more specific keys are listed before the vendor they belong to —
 * `google-drive` before `google`, or every Google product would resolve to the plain G.
 *
 * Deliberately **not** covered: the four manifests Hermes ships (`blender`, `linear`, `n8n`,
 * `unreal-engine`) and the common stdio servers (`github`, `sqlite`, `filesystem`). The
 * library has no mark for any of them, and inventing one here would put a hand-drawn logo in
 * a package that is a byte-faithful mirror of the monorepo's — see `src/icons/README.md`.
 */
const BRANDS: ReadonlyArray<readonly [string, FC<PropsWithClassName>]> = [
  ['google-drive', GoogleDriveIcon],
  ['googledrive', GoogleDriveIcon],
  ['gdrive', GoogleDriveIcon],
  ['google-calendar', GoogleCalendarIcon],
  ['googlecalendar', GoogleCalendarIcon],
  ['gcal', GoogleCalendarIcon],
  ['google-meet', GoogleMeetIcon],
  ['googlemeet', GoogleMeetIcon],
  ['gmail', GmailColoredIcon],
  ['google', GoogleIcon],
  ['slack', SlackIcon],
  ['notion', NotionIcon],
  ['discord', DiscordIcon],
  ['linkedin', LinkedInIcon],
  ['whatsapp', WhatsappIcon],
  ['teams', MsTeamsIcon],
  ['outlook', OutlookColoredIcon],
  ['excalidraw', ExcalidrawIcon],
  ['anthropic', AnthropicIcon],
  ['claude', AnthropicIcon],
  ['youtube', YoutubeIcon],
  ['instagram', InstagramIcon],
  ['reddit', RedditIcon],
]

/**
 * The mark for one server, or the generic connector glyph.
 *
 * The fallback is the honest answer for most rows on a stock install and is not a gap to be
 * filled later by guessing — it is what "Hermes does not say who this is" looks like.
 */
export function connectorIcon(name: string): FC<PropsWithClassName> {
  const key = name.toLowerCase().replace(/[^a-z0-9]/g, '')

  for (const [brand, Icon] of BRANDS) {
    if (key.includes(brand.replace(/-/g, ''))) return Icon
  }

  return ConnectorsIcon
}

/**
 * True when the row got a real brand mark.
 *
 * Brand marks carry their own colours; the generic glyph is a `currentColor` stroke and has
 * to be tinted by the row. Rendering both the same way makes one of them wrong.
 */
export function hasBrandIcon(name: string): boolean {
  return connectorIcon(name) !== ConnectorsIcon
}
