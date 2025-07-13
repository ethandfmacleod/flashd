import { trpc } from '@/lib/trpc'
import { useQueryClient } from '@tanstack/react-query'

export const useDecks = () => {
  const queryClient = useQueryClient()
  
  const decksQuery = trpc.deck.getUserDecks.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      if (error instanceof Error && error.message.includes('UNAUTHORIZED')) {
        return false
      }
      return failureCount < 3
    },
  })
  
  const createDeckMutation = trpc.deck.createDeck.useMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [['deck', 'getUserDecks']] })
    },
    onError: (error) => {
      console.error('Failed to create deck:', error)
    },
  })
  
  const updateDeckMutation = trpc.deck.updateDeck.useMutation({
    onMutate: async (updatedDeck) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: [['deck', 'getUserDecks']] })
      
      // Snapshot previous value
      const previousDecks = queryClient.getQueryData([['deck', 'getUserDecks']])
      
      // Optimistically update
      queryClient.setQueryData([['deck', 'getUserDecks']], (old: any) =>
        old?.map((deck: any) => 
          deck.id === updatedDeck.id ? { ...deck, ...updatedDeck } : deck
        )
      )
      
      return { previousDecks }
    },
    onError: (err, updatedDeck, context) => {
      // Rollback on error
      queryClient.setQueryData([['deck', 'getUserDecks']], context?.previousDecks)
      console.error('Failed to update deck:', err)
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [['deck', 'getUserDecks']] })
    },
  })
  
  const deleteDeckMutation = trpc.deck.deleteDeck.useMutation({
    onMutate: async (deckId) => {
      await queryClient.cancelQueries({ queryKey: [['deck', 'getUserDecks']] })
      const previousDecks = queryClient.getQueryData([['deck', 'getUserDecks']])
      
      queryClient.setQueryData([['deck', 'getUserDecks']], (old: any) =>
        old?.filter((deck: any) => deck.id !== deckId)
      )
      
      return { previousDecks }
    },
    onError: (err, deckId, context) => {
      queryClient.setQueryData([['deck', 'getUserDecks']], context?.previousDecks)
      console.error('Failed to delete deck:', err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [['deck', 'getUserDecks']] })
    },
  })
  
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
    createDeck: createDeckMutation.mutate,
    updateDeck: updateDeckMutation.mutate,
    deleteDeck: deleteDeckMutation.mutate,
    
    // Reset mutations
    resetCreateError: createDeckMutation.reset,
    resetUpdateError: updateDeckMutation.reset,
    resetDeleteError: deleteDeckMutation.reset,
  }
}