import { describe, expect, it } from 'vitest'
import { secretLabel } from '.'

/**
 * The label is the only place this UI names a vendor, and it names one from an
 * env var alone. So the two things worth holding are the shape of a known
 * provider's label and — the one that would actually hurt — that an unknown
 * variable is rendered rather than attributed to somebody.
 */

describe('secretLabel', () => {
  it('names the providers it is confident about', () => {
    expect(secretLabel('FAL_KEY')).toBe('Fal AI · API key')
    expect(secretLabel('OPENROUTER_API_KEY')).toBe('OpenRouter · API key')
    expect(secretLabel('ANTHROPIC_API_KEY')).toBe('Anthropic · API key')
    expect(secretLabel('OPENAI_API_KEY')).toBe('OpenAI · API key')
    expect(secretLabel('GEMINI_API_KEY')).toBe('Google Gemini · API key')
    expect(secretLabel('ELEVENLABS_API_KEY')).toBe('ElevenLabs · API key')
  })

  it('reads the credential kind off the tail rather than assuming a key', () => {
    expect(secretLabel('REPLICATE_API_TOKEN')).toBe('Replicate · API token')
    expect(secretLabel('GITHUB_TOKEN')).toBe('GitHub · token')
    expect(secretLabel('HF_TOKEN')).toBe('Hugging Face · token')
    expect(secretLabel('STRIPE_SECRET_KEY')).toBe('Stripe · secret key')
    expect(secretLabel('AWS_SECRET_ACCESS_KEY')).toBe('AWS · secret access key')
    expect(secretLabel('AWS_ACCESS_KEY_ID')).toBe('AWS · access key ID')
    expect(secretLabel('TWILIO_ACCOUNT_SID')).toBe('Twilio · account SID')
    expect(secretLabel('SUPABASE_SERVICE_ROLE_KEY')).toBe('Supabase · service role key')
  })

  it('keeps acronyms shouted in a tail it has to humanise', () => {
    expect(secretLabel('NOTION_INTERNAL_INTEGRATION_TOKEN')).toBe(
      'Notion · internal integration token',
    )
    expect(secretLabel('SENTRY_PROJECT_DSN')).toBe('Sentry · project DSN')
  })

  it('takes the longest provider prefix, so a two-word vendor wins', () => {
    expect(secretLabel('AZURE_OPENAI_API_KEY')).toBe('Azure OpenAI · API key')
    expect(secretLabel('BRAVE_SEARCH_API_KEY')).toBe('Brave Search · API key')
    expect(secretLabel('BRAVE_API_KEY')).toBe('Brave Search · API key')
    expect(secretLabel('FAL_AI_API_KEY')).toBe('Fal AI · API key')
  })

  it('falls back to the gateway’s own word when the var is only the provider', () => {
    expect(secretLabel('FAL')).toBe('Fal AI · secret')
  })

  it('matches whatever case and padding the payload arrives in', () => {
    expect(secretLabel('fal_key')).toBe('Fal AI · API key')
    expect(secretLabel('  ANTHROPIC_API_KEY  ')).toBe('Anthropic · API key')
  })

  it('renders an unknown variable verbatim instead of inventing a vendor', () => {
    expect(secretLabel('ACME_WIDGET_TOKEN')).toBe('ACME_WIDGET_TOKEN')
    expect(secretLabel('INTERNAL_BILLING_KEY')).toBe('INTERNAL_BILLING_KEY')
  })

  it('leaves out the vendors whose env var is genuinely ambiguous', () => {
    // Apollo.io and Apollo GraphQL both ship `APOLLO_API_KEY`; `GOOGLE_API_KEY`
    // spans a dozen products; `AZURE` alone is only mapped as `AZURE_OPENAI`.
    expect(secretLabel('APOLLO_API_KEY')).toBe('APOLLO_API_KEY')
    expect(secretLabel('GOOGLE_API_KEY')).toBe('GOOGLE_API_KEY')
    expect(secretLabel('AZURE_API_KEY')).toBe('AZURE_API_KEY')
  })

  it('never mines the prompt for a provider it cannot see in the var', () => {
    // The honest failure is a label nobody can misread, not a confident guess:
    // the prompt is rendered as the card's help text instead.
    expect(secretLabel('ACME_TOKEN', 'Paste the Linear API key from linear.app/settings')).toBe(
      'ACME_TOKEN',
    )
    expect(secretLabel('FAL_KEY', 'Paste your OpenAI key')).toBe('Fal AI · API key')
  })

  it('says something truthful when the payload names no variable at all', () => {
    // `SecretRequestPayload.env_var` is optional on the wire.
    expect(secretLabel('')).toBe('Secret value')
    expect(secretLabel('   ')).toBe('Secret value')
    expect(secretLabel('', 'The skill needs a credential')).toBe('Secret value')
  })

  describe("the skill author's own label", () => {
    it('uses an authored prompt when no provider is recognised', () => {
      // Observed live: OUTREACHMAGIC_AGENT_KEY with this exact frontmatter prompt.
      expect(secretLabel('OUTREACHMAGIC_AGENT_KEY', 'Outreach Magic agent key')).toBe(
        'Outreach Magic agent key',
      )
    })

    it('still prefers a recognised provider over the prompt', () => {
      // The map wins, and it produces the canvas' own label for this var.
      expect(secretLabel('FAL_KEY', 'Outreach Magic agent key')).toBe('Fal AI · API key')
    })

    it("ignores the gateway's generated prompt", () => {
      // tools/skills_tool.py:336 — carries nothing the var does not.
      expect(secretLabel('ACME_WIDGET_TOKEN', 'Enter value for ACME_WIDGET_TOKEN')).toBe(
        'ACME_WIDGET_TOKEN',
      )
    })

    it('ignores an instruction rather than labelling a field with it', () => {
      expect(secretLabel('ACME_WIDGET_TOKEN', 'Paste your key from the dashboard')).toBe(
        'ACME_WIDGET_TOKEN',
      )
    })

    it('ignores prose too long to be a label', () => {
      const prose =
        'The long-lived credential issued by the workspace owner for this integration'
      expect(secretLabel('ACME_WIDGET_TOKEN', prose)).toBe('ACME_WIDGET_TOKEN')
    })

    it('trims trailing punctuation from an authored label', () => {
      expect(secretLabel('ACME_WIDGET_TOKEN', 'Acme widget token:')).toBe('Acme widget token')
    })
  })
})
