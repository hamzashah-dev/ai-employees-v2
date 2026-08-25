import type { FC } from 'react'
import type { PropsWithClassName } from '@repo/types/common'
import { DiscordIcon } from '@repo/icons/discord'
import { ExcelIcon } from '@repo/icons/microsoft-excel-icon'
import { FacebookIcon } from '@repo/icons/facebook'
import { GmailColoredIcon } from '@repo/icons/gmail-colored'
import { GoogleCalendarIcon } from '@repo/icons/google-calendar-icon'
import { GoogleDriveIcon } from '@repo/icons/google-drive-icon'
import { GoogleMeetIcon } from '@repo/icons/google-meet-icon'
import { InstagramIcon } from '@repo/icons/instagram'
import { LinkedInIcon } from '@repo/icons/linkedin-icon'
import { MsTeamsIcon } from '@repo/icons/ms-teams-icon'
import { NotionIcon } from '@repo/icons/notion-icon'
import { OutlookColoredIcon } from '@repo/icons/outlook-colored'
import { RedditIcon } from '@repo/icons/reddit-icon'
import { SheetsIcon } from '@repo/icons/sheets-icon'
import { SlackIcon } from '@repo/icons/slack-icon'
import { TwitterIcon } from '@repo/icons/twitter'
import { WhatsappIcon } from '@repo/icons/whatsapp-icon'
import { YoutubeIcon } from '@repo/icons/youtube'
import { ZoomIcon } from '@repo/icons/zoom-icon'

/**
 * The services an agent can be wired to — the "Connects to" chips on the agent
 * detail surface.
 *
 * Hermes has no connector registry: its only integration surface is MCP
 * (`/api/mcp/catalog`, whose shipped manifests are `blender`, `linear`, `n8n`
 * and `unreal-engine`) plus per-profile environment variables
 * (`GET`/`PUT /api/env`). Nothing here maps to a backend "connected" flag, so
 * a chip may state what an agent needs but must never claim it is connected.
 *
 * Every entry is a real glyph that ships in `@repo/icons`. A service without a
 * glyph does not get an entry — a stand-in icon reads as a different product.
 *
 * Two name traps in this list: `@repo/icons/twitter` is the X wordmark (the
 * `x` icon is a plain cross), and `whatsapp-icon` and `whatsapp` both export
 * `WhatsappIcon` — the former is the brand green, the latter `currentColor`.
 */
export interface Connector {
  id: string
  /** How the service is written on the chip — the vendor's own casing. */
  label: string
  Icon: FC<PropsWithClassName>
}

export const CONNECTORS = {
  gmail: { id: 'gmail', label: 'Gmail', Icon: GmailColoredIcon },
  outlook: { id: 'outlook', label: 'Outlook', Icon: OutlookColoredIcon },
  slack: { id: 'slack', label: 'Slack', Icon: SlackIcon },
  discord: { id: 'discord', label: 'Discord', Icon: DiscordIcon },
  whatsapp: { id: 'whatsapp', label: 'WhatsApp', Icon: WhatsappIcon },
  'ms-teams': { id: 'ms-teams', label: 'Microsoft Teams', Icon: MsTeamsIcon },
  'google-drive': { id: 'google-drive', label: 'Google Drive', Icon: GoogleDriveIcon },
  'google-calendar': {
    id: 'google-calendar',
    label: 'Google Calendar',
    Icon: GoogleCalendarIcon,
  },
  'google-meet': { id: 'google-meet', label: 'Google Meet', Icon: GoogleMeetIcon },
  'google-sheets': { id: 'google-sheets', label: 'Google Sheets', Icon: SheetsIcon },
  zoom: { id: 'zoom', label: 'Zoom', Icon: ZoomIcon },
  notion: { id: 'notion', label: 'Notion', Icon: NotionIcon },
  excel: { id: 'excel', label: 'Excel', Icon: ExcelIcon },
  linkedin: { id: 'linkedin', label: 'LinkedIn', Icon: LinkedInIcon },
  x: { id: 'x', label: 'X', Icon: TwitterIcon },
  instagram: { id: 'instagram', label: 'Instagram', Icon: InstagramIcon },
  facebook: { id: 'facebook', label: 'Facebook', Icon: FacebookIcon },
  youtube: { id: 'youtube', label: 'YouTube', Icon: YoutubeIcon },
  reddit: { id: 'reddit', label: 'Reddit', Icon: RedditIcon },
} as const satisfies Record<string, Connector>

export type ConnectorId = keyof typeof CONNECTORS
