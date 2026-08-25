import type { PropsWithClassName } from '@repo/types/common'
import type { FC } from 'react'
import { BrainIcon } from '@repo/icons/brain-icon'
import { CheckListIcon } from '@repo/icons/check-list-icon'
import { ClockIcon } from '@repo/icons/clock'
import { ConnectorsIcon } from '@repo/icons/connectors-icon'
import { EyeIcon } from '@repo/icons/eye-icon'
import { GlobeIcon } from '@repo/icons/globe-icon'
import { GlobeSearchIcon } from '@repo/icons/globe-search-icon'
import { ImageIcon } from '@repo/icons/image-icon'
import { PageIcon } from '@repo/icons/page-icon'
import { PaintIcon } from '@repo/icons/paint-icon'
import { SkillsIcon } from '@repo/icons/skills-icon'
import { TerminalIcon } from '@repo/icons/terminal-icon'
import { UploadIcon } from '@repo/icons/upload-icon'
import { VideoIcon } from '@repo/icons/video-icon'

type IconComponent = FC<PropsWithClassName>

/**
 * One icon per tool family, ported from upstream and trimmed to the tools this gateway
 * actually exposes. Anything unlisted — every forge and MCP tool — falls back rather than
 * going without a marker.
 */
const TOOL_FAMILIES: { Icon: IconComponent; tools: string[] }[] = [
  { Icon: PageIcon, tools: ['read_file', 'write_file', 'patch', 'search_files'] },
  { Icon: TerminalIcon, tools: ['terminal', 'process', 'execute_code'] },
  {
    Icon: GlobeSearchIcon,
    tools: ['web_search', 'web_extract', 'deep_research', 'session_search'],
  },
  {
    Icon: GlobeIcon,
    tools: ['browser_navigate', 'browser_click', 'browser_type', 'browser_snapshot'],
  },
  { Icon: SkillsIcon, tools: ['skills_list', 'skill_manage'] },
  { Icon: EyeIcon, tools: ['skill_view', 'vision_analyze'] },
  { Icon: CheckListIcon, tools: ['todo', 'clarify', 'memory', 'delegate_task'] },
  { Icon: UploadIcon, tools: ['publish_artifact', 'publish_composition'] },
  { Icon: ClockIcon, tools: ['cronjob'] },
  { Icon: ConnectorsIcon, tools: ['search_connector_tools', 'expand_connector_tools'] },
  { Icon: ImageIcon, tools: ['image_generate'] },
  { Icon: VideoIcon, tools: ['video_generate'] },
]

const TOOL_ICONS: Record<string, IconComponent> = Object.fromEntries(
  TOOL_FAMILIES.flatMap(({ Icon, tools }) => tools.map((tool) => [tool, Icon] as const)),
)

export const getToolIcon = (name: string): IconComponent => TOOL_ICONS[name] ?? PaintIcon

export const ReasoningIcon = BrainIcon
