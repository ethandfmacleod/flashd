import { useToastNotifications } from '@/components/toast'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { trpc } from '@/lib/trpc'
import { useLocalSearchParams, useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DeckDetailPage() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()
  const { showError } = useToastNotifications()

  const { data: deck, isLoading, error } = trpc.deck.getDeck.useQuery(
    { id },
    { enabled: !!id }
  )
  const { data: stats } = trpc.deck.getDeckStats.useQuery(
    { id },
    { enabled: !!id }
  )

  const deleteDeckMutation = trpc.deck.deleteDeck.useMutation({
    onSuccess: () => { router.back() },
    onError: (error: unknown) => {
      showError({ title: 'Error', description: error?.message ?? 'Unknown Error' })
    },
  })

  const handleDelete = () => {
    Alert.alert(
      'Delete Deck',
      'Are you sure you want to delete this deck? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteDeckMutation.mutate({ id: id! }),
        },
      ]
    )
  }

  const handleStudy = () => {
    router.push(`/deck/${id}/study` as any)
  }

  const handleEdit = () => {
    router.push(`/deck/${id}/edit` as any)
  }

  const handleAddCard = () => {
    router.push(`/deck/${id}/add-card` as any)
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1">
        <Box className="flex-1 justify-center items-center p-6">
          <Text className="text-red-500 text-center mb-4">
            Failed to load deck: {error.message}
          </Text>
          <Pressable onPress={() => router.back()} className="bg-blue-500 px-4 py-2 rounded">
            <Text className="text-white">Go Back</Text>
          </Pressable>
        </Box>
      </SafeAreaView>
    )
  }

  if (isLoading || !deck) {
    return (
      <SafeAreaView className="flex-1">
        <Box className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="text-gray-500 mt-4">Loading deck...</Text>
        </Box>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <VStack className="flex-1">
        <Box className="bg-white border-b border-gray-200 p-6">
          <HStack className="justify-between items-start mb-4">
            <Pressable onPress={() => router.back()}>
              <Text className="text-blue-500 text-lg">← Back</Text>
            </Pressable>
            <HStack className="space-x-4">
              <Pressable onPress={handleEdit}>
                <Text className="text-blue-500">Edit</Text>
              </Pressable>
              <Pressable onPress={handleDelete}>
                <Text className="text-red-500">Delete</Text>
              </Pressable>
            </HStack>
          </HStack>

          <VStack className="space-y-2">
            <HStack className="items-center space-x-3">
              <Box
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: deck.color || '#3b82f6' }}
              />
              <Text className="text-2xl font-bold text-gray-900">{deck.title}</Text>
            </HStack>

            {deck.description && (
              <Text className="text-gray-600">{deck.description}</Text>
            )}
          </VStack>
        </Box>

        {stats && (
          <Box className="bg-white mx-6 mt-4 p-4 rounded-lg border border-gray-200">
            <Text className="text-lg font-semibold mb-3">Deck Statistics</Text>
            <VStack className="space-y-2">
              <HStack className="justify-between">
                <Text className="text-gray-600">Total Cards:</Text>
                <Text className="font-medium">{stats.totalCards}</Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-gray-600">Reviewed:</Text>
                <Text className="font-medium">{stats.reviewedCards}</Text>
              </HStack>
              <HStack className="justify-between">
                <Text className="text-gray-600">Not Reviewed:</Text>
                <Text className="font-medium">{stats.unReviewedCards}</Text>
              </HStack>
              {stats.totalReviews > 0 && (
                <HStack className="justify-between">
                  <Text className="text-gray-600">Accuracy:</Text>
                  <Text className="font-medium">{stats.accuracy}%</Text>
                </HStack>
              )}
            </VStack>
          </Box>
        )}

        <VStack className="mx-6 mt-6 space-y-3">
          <Pressable
            onPress={handleStudy}
            className="bg-blue-500 p-4 rounded-lg"
            disabled={deck.cardCount === 0}
          >
            <Text className="text-white text-center font-semibold text-lg">
              {deck.cardCount === 0 ? 'Add Cards to Study' : `Study Deck (${deck.cardCount} cards)`}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleAddCard}
            className="bg-green-500 p-4 rounded-lg"
          >
            <Text className="text-white text-center font-semibold">Add New Card</Text>
          </Pressable>
        </VStack>

        {deck.cards && deck.cards.length > 0 && (
          <Box className="mx-6 mt-6 mb-6">
            <Text className="text-lg font-semibold mb-3">Recent Cards</Text>
            <VStack className="space-y-2">
              {deck.cards.slice(0, 3).map((card) => (
                <Box
                  key={card.id}
                  className="bg-white p-3 rounded-lg border border-gray-200"
                >
                  <Text className="font-medium text-gray-900" numberOfLines={1}>
                    {card.front}
                  </Text>
                  <Text className="text-gray-600 text-sm mt-1" numberOfLines={1}>
                    {card.back}
                  </Text>
                </Box>
              ))}
              {deck.cards.length > 3 && (
                <Text className="text-gray-500 text-center text-sm">
                  and {deck.cards.length - 3} more cards...
                </Text>
              )}
            </VStack>
          </Box>
        )}
      </VStack>
    </SafeAreaView>
  )
}