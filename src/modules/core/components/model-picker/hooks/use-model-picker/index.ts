import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { fetchModelOptions, setProfileModel } from '@/modules/core/services/hermes/rest'
import type { ModelGroup, ModelOption } from '../../utils/model-groups'
import { countModels, toModelGroups } from '../../utils/model-groups'

export interface UseModelPickerResult {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  query: string
  setQuery: (query: string) => void
  groups: ModelGroup[]
  /** Every offerable model, ignoring the query — tells "none configured" from "none match". */
  totalCount: number
  isLoading: boolean
  error: Error | null
  choose: (option: ModelOption) => void
  pendingModel?: string
  saveError?: string
}

/**
 * The model picker's state.
 *
 * The catalogue is fetched only while the menu is open. It is the one call in
 * this modal that can be slow — the backend fans out to each provider's model
 * list behind a one-hour disk cache, so a cold open pays for a live fetch — and
 * nothing on the closed modal needs it: the current model comes from the
 * profile row the header already has.
 */
export function useModelPicker(profile: string): UseModelPickerResult {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const queryClient = useQueryClient()

  const options = useQuery({
    queryKey: ['model-options', profile],
    queryFn: () => fetchModelOptions(profile),
    enabled: isOpen,
    // The catalogue is behind the backend's own 1h cache; refetching it on every
    // reopen buys nothing but a spinner.
    staleTime: 5 * 60_000,
  })

  const mutation = useMutation({
    mutationFn: (option: ModelOption) =>
      setProfileModel(profile, option.provider, option.model),
    onSuccess: () => {
      // The header reads the model off the roster payload, so that is what has
      // to be refetched — not the picker's own catalogue.
      void queryClient.invalidateQueries({ queryKey: ['profiles'] })
      setIsOpen(false)
      setQuery('')
    },
  })

  const groups = toModelGroups(options.data, query)

  return {
    isOpen,
    setIsOpen: (open) => {
      setIsOpen(open)
      if (!open) setQuery('')
    },
    query,
    setQuery,
    groups,
    totalCount: countModels(toModelGroups(options.data, '')),
    isLoading: options.isLoading,
    error: options.error,
    choose: (option) => mutation.mutate(option),
    pendingModel: mutation.isPending ? mutation.variables?.model : undefined,
    saveError: mutation.error?.message,
  }
}
