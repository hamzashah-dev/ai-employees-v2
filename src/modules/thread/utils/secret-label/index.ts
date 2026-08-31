/**
 * Name the field a `secret.request` is asking for.
 *
 * The gateway hands us an env var (`FAL_KEY`) and a prompt written for a
 * terminal. The env var is the only machine-readable identity in the payload, so
 * it is what the label is built from; the prompt is the card's help text and is
 * deliberately not mined for a vendor name — a sentence like "Paste the key from
 * your dashboard" would let us guess a provider we cannot actually know, and a
 * confidently wrong vendor on a credential field is exactly the lie the repo's
 * honesty rule exists to prevent.
 *
 * So: a small map of providers whose env var is unambiguous, and for everything
 * else the variable's own name, rendered verbatim. `ACME_WIDGET_TOKEN` reads as
 * `ACME_WIDGET_TOKEN` rather than as "Acme · API token", because we do not know
 * that there is a vendor called Acme.
 */

/**
 * Keyed by the leading segments of the env var, longest match first, so
 * `AZURE_OPENAI_API_KEY` resolves ahead of `AZURE_*` and
 * `BRAVE_SEARCH_API_KEY` ahead of `BRAVE_*`.
 *
 * Entries earn their place by being unambiguous. `APOLLO_API_KEY` is absent for
 * that reason — Apollo.io and Apollo GraphQL both use it — as is a bare
 * `GOOGLE_*`, which spans a dozen products.
 */
const PROVIDERS: Record<string, string> = {
  AI21: 'AI21 Labs',
  AIRTABLE: 'Airtable',
  ANTHROPIC: 'Anthropic',
  APIFY: 'Apify',
  ASSEMBLYAI: 'AssemblyAI',
  ATLASSIAN: 'Atlassian',
  AWS: 'AWS',
  AZURE_OPENAI: 'Azure OpenAI',
  BRAVE: 'Brave Search',
  BRAVE_SEARCH: 'Brave Search',
  CLOUDFLARE: 'Cloudflare',
  COHERE: 'Cohere',
  DATADOG: 'Datadog',
  DEEPGRAM: 'Deepgram',
  DEEPSEEK: 'DeepSeek',
  DISCORD: 'Discord',
  ELEVENLABS: 'ElevenLabs',
  EXA: 'Exa',
  FAL: 'Fal AI',
  FAL_AI: 'Fal AI',
  FIGMA: 'Figma',
  FIRECRAWL: 'Firecrawl',
  GEMINI: 'Google Gemini',
  GITHUB: 'GitHub',
  GITLAB: 'GitLab',
  GROQ: 'Groq',
  HEYGEN: 'HeyGen',
  HF: 'Hugging Face',
  HUGGINGFACE: 'Hugging Face',
  HUGGING_FACE: 'Hugging Face',
  HUBSPOT: 'HubSpot',
  JIRA: 'Jira',
  LANGFUSE: 'Langfuse',
  LINEAR: 'Linear',
  MISTRAL: 'Mistral',
  MIXPANEL: 'Mixpanel',
  NOTION: 'Notion',
  OPENAI: 'OpenAI',
  OPENROUTER: 'OpenRouter',
  PERPLEXITY: 'Perplexity',
  PINECONE: 'Pinecone',
  POSTHOG: 'PostHog',
  REPLICATE: 'Replicate',
  RESEND: 'Resend',
  SENDGRID: 'SendGrid',
  SENTRY: 'Sentry',
  SERPAPI: 'SerpApi',
  SHOPIFY: 'Shopify',
  SLACK: 'Slack',
  STABILITY: 'Stability AI',
  STRIPE: 'Stripe',
  SUPABASE: 'Supabase',
  TAVILY: 'Tavily',
  TELEGRAM: 'Telegram',
  TOGETHER: 'Together AI',
  TWILIO: 'Twilio',
  VERCEL: 'Vercel',
  XAI: 'xAI',
}

/**
 * What the tail of the var says the credential *is*. A bare `_KEY` tail is the
 * API key in every convention we have seen (`FAL_KEY`, `BRAVE_KEY`); anything
 * not listed falls through to the mechanical word rendering below, which never
 * adds a word the variable did not already contain.
 */
const CREDENTIAL_KINDS: Record<string, string> = {
  ACCESS_KEY_ID: 'access key ID',
  ACCESS_TOKEN: 'access token',
  ACCOUNT_SID: 'account SID',
  API_KEY: 'API key',
  API_SECRET: 'API secret',
  API_TOKEN: 'API token',
  AUTH_TOKEN: 'auth token',
  KEY: 'API key',
  PASSWORD: 'password',
  PUBLIC_KEY: 'public key',
  PUBLISHABLE_KEY: 'publishable key',
  SECRET: 'secret',
  SECRET_ACCESS_KEY: 'secret access key',
  SECRET_KEY: 'secret key',
  TOKEN: 'token',
  WEBHOOK_SECRET: 'webhook secret',
}

/** Words that are shouted rather than capitalised, in a lowercased phrase. */
const ACRONYMS = new Set(['API', 'DB', 'DSN', 'ID', 'JWT', 'PAT', 'SID', 'SSH', 'URI', 'URL'])

/** Shown when the payload names no variable at all, which the wire type allows. */
const UNNAMED = 'Secret value'

/**
 * A tail with no `CREDENTIAL_KINDS` entry: lowercase it word by word, keeping
 * acronyms shouted. `INTERNAL_INTEGRATION_TOKEN` -> "internal integration token".
 */
function humaniseKind(segments: string[]): string {
  return segments
    .map((segment) => (ACRONYMS.has(segment) ? segment : segment.toLowerCase()))
    .join(' ')
}

/**
 * @param envVar  The `env_var` off the `secret.request` payload.
 * @param _prompt The payload's prompt. Accepted so callers can pass the whole
 *   request, and deliberately unread: it is prose meant for a human and the card
 *   renders it as help. Deriving a vendor from it would be a guess.
 */
/**
 * The prompt the GATEWAY generates when a skill declares none —
 * `f"Enter value for {env_var}"` (`tools/skills_tool.py:336`). It carries no
 * information the env var does not already, so it must never become a label.
 */
const GENERATED_PROMPT = /^enter value for\s/i

/**
 * An instruction, not a name: a prompt that tells the user what to DO cannot
 * stand in as a field label. Kept deliberately short — these are the openers the
 * bundled skills actually use.
 */
const INSTRUCTION_PROMPT = /^(paste|enter|provide|type|copy|add|set|input|get)\b/i

/** Longer than this is prose, not a label. */
const MAX_PROMPT_LABEL = 48

export function secretLabel(envVar: string, prompt?: string): string {
  const name = envVar.trim()
  if (!name) return UNNAMED

  const segments = name.toUpperCase().split('_').filter(Boolean)

  for (let take = segments.length; take > 0; take--) {
    const provider = PROVIDERS[segments.slice(0, take).join('_')]
    if (!provider) continue
    const tail = segments.slice(take)
    // The var is nothing but the provider (`FAL`). "secret" is the gateway's own
    // word for it, so it adds no claim of its own.
    if (tail.length === 0) return `${provider} · secret`
    return `${provider} · ${CREDENTIAL_KINDS[tail.join('_')] ?? humaniseKind(tail)}`
  }

  // No provider we can vouch for. Before falling back to the raw variable, use
  // the skill author's OWN label if there is one.
  //
  // This is not mining the prompt for a vendor. A skill declares
  // `prompt: Outreach Magic agent key` in its frontmatter, and that string is
  // authored by the person who knows what the key is — strictly better evidence
  // than anything this file could infer. What is excluded is the two cases where
  // the prompt is not a name: the gateway's generated
  // `Enter value for <VAR>`, and an instruction like `Paste your key here`.
  const authored = (prompt ?? '').trim().replace(/[.:\s]+$/, '')
  if (
    authored &&
    authored.length <= MAX_PROMPT_LABEL &&
    !GENERATED_PROMPT.test(authored) &&
    !INSTRUCTION_PROMPT.test(authored)
  ) {
    return authored
  }

  // Nothing trustworthy to show but the variable's own name, unembellished.
  return name
}
