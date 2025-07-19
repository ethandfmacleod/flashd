import { trpc } from '@/lib/trpc'
import type { Card } from '@/types/api'
import { useCallback } from 'react'

export const useCards = (deckId: string) => {
  const utils = trpc.useUtils()

  const createCardMutation = trpc.deck.createCard.useMutation({
    onMutate: async (newCard) => {
      await utils.deck.getDeck.cancel({ id: deckId })
      await utils.deck.getDeckStats.cancel({ id: deckId })
      const previousDeck = utils.deck.getDeck.getData({ id: deckId })
      const previousStats = utils.deck.getDeckStats.getData({ id: deckId })

      const optimisticCard: Card = {
        id: `temp-${Date.now()}`,
        front: newCard.front,
        back: newCard.back,
        hint: newCard.hint || null,
        deckId: newCard.deckId,
        createdAt: new Date(),
        updatedAt: new Date(),
        difficulty: 0,
        lastReviewed: null,
        nextReview: null,
        reviewCount: 0,
        correctCount: 0,
      }

      if (previousDeck) {
        utils.deck.getDeck.setData(
          { id: deckId },
          {
            ...previousDeck,
            cards: [...(previousDeck.cards || []), optimisticCard],
            cardCount: previousDeck.cardCount + 1,
          },
        )
      }

      if (previousStats) {
        utils.deck.getDeckStats.setData(
          { id: deckId },
          {
            ...previousStats,
            totalCards: previousStats.totalCards + 1,
            unReviewedCards: previousStats.unReviewedCards + 1,
          },
        )
      }

      return { previousDeck, previousStats }
    },
    onError: (error, _, context) => {
      if (context?.previousDeck) {
        utils.deck.getDeck.setData({ id: deckId }, context.previousDeck)
      }
      if (context?.previousStats) {
        utils.deck.getDeckStats.setData({ id: deckId }, context.previousStats)
      }
    },
    onSettled: () => {
      utils.deck.getDeck.invalidate({ id: deckId })
      utils.deck.getDeckStats.invalidate({ id: deckId })
    },
  })

  const updateCardMutation = trpc.deck.updateCard.useMutation({
    onMutate: async (updatedCard) => {
      await utils.deck.getDeck.cancel({ id: deckId })
      const previousDeck = utils.deck.getDeck.getData({ id: deckId })

      if (previousDeck && previousDeck.cards) {
        utils.deck.getDeck.setData(
          { id: deckId },
          {
            ...previousDeck,
            cards: previousDeck.cards.map((card) =>
              card.id === updatedCard.id
                ? { ...card, ...updatedCard, updatedAt: new Date() }
                : card,
            ),
          },
        )
      }

      return { previousDeck }
    },
    onError: (error, _, context) => {
      if (context?.previousDeck) {
        utils.deck.getDeck.setData({ id: deckId }, context.previousDeck)
      }
    },
    onSettled: () => {
      utils.deck.getDeck.invalidate({ id: deckId })
    },
  })

  const deleteCardMutation = trpc.deck.deleteCard.useMutation({
    onMutate: async (variables) => {
      await utils.deck.getDeck.cancel({ id: deckId })
      await utils.deck.getDeckStats.cancel({ id: deckId })
      const previousDeck = utils.deck.getDeck.getData({ id: deckId })
      const previousStats = utils.deck.getDeckStats.getData({ id: deckId })

      if (previousDeck && previousDeck.cards) {
        utils.deck.getDeck.setData(
          { id: deckId },
          {
            ...previousDeck,
            cards: previousDeck.cards.filter((card) => card.id !== variables.id),
            cardCount: previousDeck.cardCount - 1,
          },
        )
      }

      if (previousStats) {
        const cardToDelete = previousDeck?.cards?.find((card) => card.id === variables.id)
        const wasReviewed = cardToDelete?.lastReviewed !== null

        utils.deck.getDeckStats.setData(
          { id: deckId },
          {
            ...previousStats,
            totalCards: previousStats.totalCards - 1,
            reviewedCards: wasReviewed
              ? previousStats.reviewedCards - 1
              : previousStats.reviewedCards,
            unReviewedCards: wasReviewed
              ? previousStats.unReviewedCards
              : previousStats.unReviewedCards - 1,
          },
        )
      }

      return { previousDeck, previousStats }
    },
    onError: (error, _, context) => {
      if (context?.previousDeck) {
        utils.deck.getDeck.setData({ id: deckId }, context.previousDeck)
      }
      if (context?.previousStats) {
        utils.deck.getDeckStats.setData({ id: deckId }, context.previousStats)
      }
    },
    onSettled: () => {
      utils.deck.getDeck.invalidate({ id: deckId })
      utils.deck.getDeckStats.invalidate({ id: deckId })
    },
  })

  const createCard = useCallback(
    (input: { front: string; back: string; hint?: string }) => {
      return createCardMutation.mutateAsync({
        deckId,
        ...input,
      })
    },
    [createCardMutation, deckId],
  )

  const updateCard = useCallback(
    (input: { id: string; front?: string; back?: string; hint?: string }) => {
      return updateCardMutation.mutateAsync(input)
    },
    [updateCardMutation],
  )

  const deleteCard = useCallback(
    (cardId: string) => {
      return deleteCardMutation.mutateAsync({ id: cardId })
    },
    [deleteCardMutation],
  )

  return {
    // Loading states
    isCreating: createCardMutation.isPending,
    isUpdating: updateCardMutation.isPending,
    isDeleting: deleteCardMutation.isPending,

    // Error states
    createError: createCardMutation.error,
    updateError: updateCardMutation.error,
    deleteError: deleteCardMutation.error,

    // Actions
    createCard,
    updateCard,
    deleteCard,

    // Reset mutations
    resetCreateError: createCardMutation.reset,
    resetUpdateError: updateCardMutation.reset,
    resetDeleteError: deleteCardMutation.reset,
  }
}
