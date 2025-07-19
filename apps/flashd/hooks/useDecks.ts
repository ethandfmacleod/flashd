import { trpc } from '@/lib/trpc'
import { FIVE_MINUTES } from '@/lib/utility/constants'
import type { Deck, DeckCreateInput, DeckUpdateInput } from '@/types/api'
import { useCallback } from 'react'

export const useDecks = () => {
  const utils = trpc.useUtils()

  const decksQuery = trpc.deck.getUserDecks.useQuery(undefined, {
    staleTime: FIVE_MINUTES,
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
        return false
      }
      return failureCount < 3
    },
  })

  const createDeckMutation = trpc.deck.createDeck.useMutation({
    onMutate: async (newDeck: DeckCreateInput) => {
      await utils.deck.getUserDecks.cancel()
      const previousDecks = utils.deck.getUserDecks.getData()

      const optimisticDeck: Deck = {
        id: `temp-${Date.now()}`,
        title: newDeck.title,
        description: newDeck.description ?? null,
        color: newDeck.color ?? null,
        isPublic: newDeck.isPublic ?? false,
        userId: 'temp-user',
        cardCount: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { cards: 0 },
      }

      utils.deck.getUserDecks.setData(undefined, (old) =>
        old ? [optimisticDeck, ...old] : [optimisticDeck],
      )

      return { previousDecks }
    },
    onError: (_, __, context) => {
      utils.deck.getUserDecks.setData(undefined, context?.previousDecks)
    },
    onSettled: () => {
      utils.deck.getUserDecks.invalidate()
    },
  })

  const updateDeckMutation = trpc.deck.updateDeck.useMutation({
    onMutate: async (updatedDeck: DeckUpdateInput) => {
      await utils.deck.getUserDecks.cancel()
      const previousDecks = utils.deck.getUserDecks.getData()

      utils.deck.getUserDecks.setData(
        undefined,
        (old) =>
          old?.map((deck) =>
            deck.id === updatedDeck.id ? { ...deck, ...updatedDeck, updatedAt: new Date() } : deck,
          ) ?? [],
      )

      return { previousDecks }
    },
    onError: (err, _, context) => {
      utils.deck.getUserDecks.setData(undefined, context?.previousDecks)
      console.error('Failed to update deck:', err)
    },
    onSettled: () => {
      utils.deck.getUserDecks.invalidate()
    },
  })

  const deleteDeckMutation = trpc.deck.deleteDeck.useMutation({
    onMutate: async (variables: { id: string }) => {
      await utils.deck.getUserDecks.cancel()
      const previousDecks = utils.deck.getUserDecks.getData()

      utils.deck.getUserDecks.setData(
        undefined,
        (old) => old?.filter((deck) => deck.id !== variables.id) ?? [],
      )

      return { previousDecks }
    },
    onError: (err, _, context) => {
      utils.deck.getUserDecks.setData(undefined, context?.previousDecks)
      console.error('Failed to delete deck:', err)
    },
    onSettled: () => {
      utils.deck.getUserDecks.invalidate()
    },
  })

  const createDeck = useCallback(
    (input: DeckCreateInput) => {
      return createDeckMutation.mutateAsync(input)
    },
    [createDeckMutation],
  )

  const updateDeck = useCallback(
    (input: DeckUpdateInput) => {
      return updateDeckMutation.mutateAsync(input)
    },
    [updateDeckMutation],
  )

  const deleteDeck = useCallback(
    (id: string) => {
      return deleteDeckMutation.mutateAsync({ id })
    },
    [deleteDeckMutation],
  )

  return {
    // Data
    decks: decksQuery.data,

    // Loading states
    isLoading: decksQuery.isLoading,
    isCreating: createDeckMutation.isPending,
    isUpdating: updateDeckMutation.isPending,
    isDeleting: deleteDeckMutation.isPending,

    // Error states
    error: decksQuery.error,
    createError: createDeckMutation.error,
    updateError: updateDeckMutation.error,
    deleteError: deleteDeckMutation.error,

    // Actions
    refetch: decksQuery.refetch,
    createDeck,
    updateDeck,
    deleteDeck,

    // Reset mutations
    resetCreateError: createDeckMutation.reset,
    resetUpdateError: updateDeckMutation.reset,
    resetDeleteError: deleteDeckMutation.reset,
  }
}
