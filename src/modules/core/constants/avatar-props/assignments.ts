import type { AvatarPropId } from '.'

/**
 * Which prop each catalogue agent wears.
 *
 * Keyed by Hermes profile slug rather than by a catalogue type on purpose: `core` may not
 * import a feature module, and this map has to be readable from the roster, the thread header
 * and the marketplace alike. The slugs are the catalogue's own ids, which are already valid
 * profile names — `POST /api/profiles` creates the profile under exactly this string.
 *
 * Assignments are explicit rather than derived. A prop is a claim about what an employee does,
 * and there is no field in Hermes to derive that from: `ProfileInfo` carries no role, and
 * inferring one from the toolset would make an avatar mutate when someone toggles a tool.
 */
export const AGENT_PROP: Record<string, AvatarPropId> = {
  // Business Ops
  'account-manager': 'businessman',
  'contract-reader': 'signature',
  'meeting-scheduler': 'calendar',
  'onboarding-buddy': 'graduation-cap',
  'ops-reporter': 'bar-chart',
  'policy-keeper': 'signature',
  'purchase-clerk': 'package',
  'startup-kit-agent': 'idea',
  'talent-scout': 'conference-call',
  'vendor-manager': 'briefcase',
  // Comms
  'customer-support': 'headset',
  'intro-broker': 'conference-call',
  'language-bridge': 'globe',
  'meeting-notes': 'document',
  'reply-drafter': 'comments',
  'status-reporter': 'news',
  'voicemail-triage': 'headset',
  // Content
  'blog-drafter': 'news',
  'caption-writer': 'document',
  'clip-finder': 'film-reel',
  'content-calendar': 'calendar',
  'newsletter-editor': 'news',
  'podcast-producer': 'music',
  'script-writer': 'document',
  'shorts-maker': 'film-reel',
  'thumbnail-artist': 'picture',
  // Creative
  'brand-keeper': 'inspection',
  'cover-artist': 'picture',
  'logo-explorer': 'idea',
  'moodboard-maker': 'picture',
  'slide-designer': 'idea',
  'sound-designer': 'music',
  // Engineering
  'bug-hunter': 'inspection',
  'code-reviewer': 'command-line',
  'dependency-warden': 'package',
  'docs-keeper': 'document',
  'incident-scribe': 'news',
  'on-call-buddy': 'alarm-clock',
  'performance-profiler': 'line-chart',
  'release-manager': 'deployment',
  'test-writer': 'puzzle',
  // Growth & Marketing
  'ad-copywriter': 'advertising',
  'ad-creator': 'advertising',
  'campaign-analyst': 'line-chart',
  'community-manager': 'conference-call',
  'landing-page-writer': 'document',
  'launch-planner': 'idea',
  'lifecycle-emailer': 'comments',
  'linkedin-agent': 'businessman',
  'outbound-agent': 'bar-chart',
  'sales-outbound': 'bullish',
  'seo-editor': 'search',
  'social-scheduler': 'calendar',
  // Health & Wellbeing
  'appointment-keeper': 'calendar',
  'habit-keeper': 'todo-list',
  'meal-planner': 'shop',
  'recovery-coach': 'like',
  'sleep-coach': 'alarm-clock',
  'training-partner': 'like',
  // Home & Devices
  'device-medic': 'electricity',
  'energy-watcher': 'electricity',
  'grocery-planner': 'shop',
  'home-keeper': 'home',
  'package-tracker': 'package',
  'repair-scheduler': 'electricity',
  // Learning
  'code-tutor': 'command-line',
  'exam-prepper': 'graduation-cap',
  'flashcard-maker': 'reading',
  'language-tutor': 'globe',
  'reading-list': 'reading',
  'study-coach': 'graduation-cap',
  // Money
  'budget-keeper': 'calculator',
  'expense-clerk': 'calculator',
  'expense-manager': 'currency-exchange',
  'invoice-chaser': 'currency-exchange',
  'payroll-checker': 'bar-chart',
  'subscription-auditor': 'inspection',
  'tax-prepper': 'calculator',
  // Personal
  'calendar-keeper': 'calendar',
  'chief-of-staff': 'manager',
  'day-planner': 'todo-list',
  'errand-runner': 'package',
  'gift-finder': 'shop',
  'inbox-triage': 'comments',
  'life-admin': 'todo-list',
  'personal-shopper': 'shop',
  'travel-planner': 'globe',
  // Research
  'competitor-watch': 'binoculars',
  'due-diligence': 'inspection',
  'field-researcher': 'search',
  'market-sizer': 'bar-chart',
  'paper-reader': 'reading',
  'survey-analyst': 'survey',
  // Security & Privacy
  'access-auditor': 'key',
  'backup-checker': 'data-backup',
  'breach-watch': 'privacy',
  'phishing-checker': 'privacy',
  'privacy-cleaner': 'privacy',
  'secret-scanner': 'key',
}

/**
 * The prop a profile gets when `AGENT_PROP` does not name one.
 *
 * There is deliberately no hash fallback. A random prop makes a false claim about what an
 * employee does, and a wrong claim is worse than a general one — so an unknown profile wears
 * its category's prop, and a profile whose category we do not know wears none at all.
 *
 * Typed against `string` rather than `AgentCategory` for the layering reason above; the
 * marketplace asserts coverage of the real union at its own boundary.
 */
export const CATEGORY_PROP = {
  'Personal': 'todo-list',
  'Research': 'search',
  'Engineering': 'command-line',
  'Money': 'currency-exchange',
  'Content': 'document',
  'Creative': 'picture',
  'Growth & Marketing': 'advertising',
  'Comms': 'comments',
  'Business Ops': 'briefcase',
  'Learning': 'graduation-cap',
  'Health & Wellbeing': 'like',
  'Home & Devices': 'home',
  'Security & Privacy': 'privacy',
} as const satisfies Record<string, AvatarPropId>
