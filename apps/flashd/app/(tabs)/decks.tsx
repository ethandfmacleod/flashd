import { ErrorBoundary } from '@/components/ErrorBoundary'
import { QueryErrorFallback } from '@/components/QueryErrorFallback'
import { Box } from '@/components/ui/box'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useDecks } from '@/hooks/useDecks'
import { useRouter } from 'expo-router'
import React from 'react'
import { ActivityIndicator, FlatList, RefreshControl } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import { plural } from '@/lib/utility/functions'
import { Deck } from '@/types/api'

interface DeckCardProps {
  deck: Deck
  onPress: () => void
}

function DeckCard({ deck, onPress }: DeckCardProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(date))
  }

  return (
    <Pressable
      onPress={onPress}
      className="mb-4 p-4 bg-white rounded-lg border border-gray-200 shadow-sm"
    >
      <VStack className="space-y-2">
        <HStack className="justify-between items-start">
          <VStack className="flex-1 mr-4">
            <Text className="text-lg font-semibold text-gray-900">{deck.title}</Text>
            {deck.description && (
              <Text className="text-sm text-gray-600 mt-1" numberOfLines={2}>
                {deck.description}
              </Text>
            )}
          </VStack>
          <Box
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: deck.color || '#3b82f6' }}
          />
        </HStack>

        <HStack className="justify-between items-center mt-3">
          <Text className="text-sm text-gray-500">
            {plural('card', deck.cardCount)}
          </Text>
          <Text className="text-sm text-gray-400">
            Updated {formatDate(deck.updatedAt)}
          </Text>
        </HStack>
      </VStack>
    </Pressable>
  )
}

export default function DecksPage() {
  return (
    <ErrorBoundary>
      <DecksContent />
    </ErrorBoundary>
  )
}

function DecksContent() {
  const router = useRouter()
  const { decks, isLoading, error, refetch } = useDecks()

  const handleDeckPress = (deckId: string) => {
    router.push(`/deck/${deckId}`)
  }

  const handleCreateDeck = () => {
    router.push('/deck/create')
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1">
        <QueryErrorFallback
          error={error}
          onRetry={() => refetch()}
          isLoading={isLoading}
        />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <VStack className="flex-1">
        <HStack className="justify-between items-center p-6 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">My Decks</Text>
          <Pressable
            onPress={handleCreateDeck}
            className="bg-blue-500 px-4 py-2 rounded-lg"
          >
            <Text className="text-white font-medium">+ New Deck</Text>
          </Pressable>
        </HStack>

        <Box className="flex-1 px-6">
          {isLoading ? (
            <Box className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#3b82f6" />
              <Text className="text-gray-500 mt-4">Loading your decks...</Text>
            </Box>
          ) : !decks || decks.length === 0 ? (
            <Box className="flex-1 justify-center items-center">
              <Text className="text-xl font-semibold text-gray-700 mb-2">No decks yet</Text>
              <Text className="text-gray-500 text-center mb-6 max-w-sm">
                Create your first flashcard deck to start learning!
              </Text>
              <Pressable
                onPress={handleCreateDeck}
                className="bg-blue-500 px-6 py-3 rounded-lg"
              >
                <Text className="text-white font-medium">Create Your First Deck</Text>
              </Pressable>
            </Box>
          ) : (
            <FlatList
              data={decks}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <DeckCard
                  deck={item}
                  onPress={() => handleDeckPress(item.id)}
                />
              )}
              contentContainerStyle={{ paddingVertical: 20 }}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={refetch}
                  colors={['#3b82f6']}
                />
              }
              showsVerticalScrollIndicator={false}
            />
          )}
        </Box>
      </VStack>
    </SafeAreaView>
  )
}
