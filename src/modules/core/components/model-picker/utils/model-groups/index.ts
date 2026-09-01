import type { HermesModelOptions, HermesModelProvider } from '@/modules/core/services/hermes/types'

export interface ModelOption {
  provider: string
  providerLabel: string
  model: string
}

export interface ModelGroup {
  provider: string
  label: string
  models: ModelOption[]
}

/**
 * Flatten the picker payload into provider-grouped options, filtered by a query.
 *
 * Pure, because the interesting decisions are all here and none of them need a
 * DOM to check: which providers are offerable, how a query matches, and what
 * "nothing found" looks like.
 *
 * Unauthenticated providers are dropped rather than shown disabled. The endpoint
 * already omits unconfigured ones, but a provider can be *listed* and not
 * authenticated — and this app has no surface for signing one in, so offering it
 * would be a control that cannot succeed.
 */
export function toModelGroups(
  options: HermesModelOptions | undefined,
  query: string,
): ModelGroup[] {
  if (!options) return []

  const needle = query.trim().toLowerCase()

  const matches = (provider: HermesModelProvider, model: string): boolean => {
    if (!needle) return true
    // Match the provider name too, so "anthropic" finds its whole shelf even
    // though the bare Anthropic model ids do not carry the vendor prefix.
    return (
      model.toLowerCase().includes(needle) || provider.name.toLowerCase().includes(needle)
    )
  }

  return options.providers
    .filter((provider) => provider.authenticated)
    .map((provider) => ({
      provider: provider.slug,
      label: provider.name,
      models: provider.models
        .filter((model) => matches(provider, model))
        .map((model) => ({
          provider: provider.slug,
          providerLabel: provider.name,
          model,
        })),
    }))
    .filter((group) => group.models.length > 0)
}

/** How many models are on offer, for the "no matches" copy and for tests. */
export function countModels(groups: ModelGroup[]): number {
  return groups.reduce((total, group) => total + group.models.length, 0)
}
