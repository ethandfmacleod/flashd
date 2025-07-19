import { ErrorBoundary } from '@/components/ErrorBoundary'
import { QueryErrorFallback } from '@/components/QueryErrorFallback'
import { useToastNotifications } from '@/components/alerts'
import { Form, FormInput } from '@/components/forms'
import { Box } from '@/components/ui/box'
import { Button, ButtonText } from '@/components/ui/button'
import { HStack } from '@/components/ui/hstack'
import { Pressable } from '@/components/ui/pressable'
import { Text } from '@/components/ui/text'
import { VStack } from '@/components/ui/vstack'
import { useDecks } from '@/hooks/useDecks'
import { useRouter } from 'expo-router'
import { EditIcon, MoreVerticalIcon, PlusIcon, TrashIcon } from 'lucide-react-native'
import React, { useState } from 'react'
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { z } from 'zod'

import type { Deck, DeckCreateInput } from '@/types/api'

// Deck creation schema
const deckSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title too long'),
  description: z.string().optional(),
  color: z.string().optional(),
  isPublic: z.boolean().optional(),
})

type DeckFormData = z.infer<typeof deckSchema>

const DECK_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#84cc16', // Lime
]

interface DeckCardProps {
  deck: Deck
  onPress: () => void
  onEdit: (deck: Deck) => void
  onDelete: (deck: Deck) => void
}

function DeckCard({ deck, onPress, onEdit, onDelete }: DeckCardProps) {
  const [showMenu, setShowMenu] = useState(false)

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  const handleMenuPress = (e: any) => {
    e.stopPropagation()
    setShowMenu(!showMenu)
  }

  const handleEdit = (e: any) => {
    e.stopPropagation()
    setShowMenu(false)
    onEdit(deck)
  }

  const handleDelete = (e: any) => {
    e.stopPropagation()
    setShowMenu(false)
    onDelete(deck)
  }

  return (
    <Box className="relative w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5 p-2">
      <Pressable
        onPress={onPress}
        className="bg-white rounded-xl border border-gray-200 shadow-sm w-full h-48"
      >
        <VStack className="flex-1 p-4">
          <HStack className="justify-between items-start mb-3">
            <HStack className="flex-1 items-center space-x-3">
              <Box
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{ backgroundColor: deck.color || '#3b82f6' }}
              />
              <Text className="text-sm font-bold text-gray-900 flex-1" numberOfLines={1}>
                {deck.title}
              </Text>
            </HStack>
            <Pressable onPress={handleMenuPress} className="p-1 -m-1 ml-2">
              <MoreVerticalIcon size={16} color="#6b7280" />
            </Pressable>
          </HStack>

          <Box className="flex-1 justify-start mb-3">
            {deck.description ? (
              <Text className="text-xs text-gray-600" numberOfLines={4}>
                {deck.description}
              </Text>
            ) : (
              <Text className="text-xs text-gray-400 italic">
                No description
              </Text>
            )}
          </Box>

          <HStack className="justify-between items-center">
            <Text className="text-xs font-medium text-gray-900">
              {deck.cardCount} {deck.cardCount === 1 ? 'card' : 'cards'}
            </Text>
            <Text className="text-xs text-gray-400">
              {formatDate(deck.updatedAt)}
            </Text>
          </HStack>
        </VStack>
      </Pressable>

      {showMenu && (
        <Box className="absolute top-12 right-2 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-32">
          <Pressable
            onPress={handleEdit}
            className="flex-row items-center px-3 py-2 border-b border-gray-100"
          >
            <EditIcon size={16} color="#6b7280" />
            <Text className="ml-2 text-gray-700">Edit</Text>
          </Pressable>
          <Pressable
            onPress={handleDelete}
            className="flex-row items-center px-3 py-2"
          >
            <TrashIcon size={16} color="#ef4444" />
            <Text className="ml-2 text-red-500">Delete</Text>
          </Pressable>
        </Box>
      )}
    </Box>
  )
}

interface DeckFormModalProps {
  visible: boolean
  onClose: () => void
  onSubmit: (data: DeckFormData) => Promise<void>
  deck?: Deck | null
  isLoading?: boolean
}

function DeckFormModal({ visible, onClose, onSubmit, deck, isLoading }: DeckFormModalProps) {
  const [selectedColor, setSelectedColor] = useState(deck?.color || DECK_COLORS[0])

  const handleSubmit = async (data: DeckFormData) => {
    console.log('Modal form data:', data)
    console.log('Selected color:', selectedColor)
    const submitData = {
      ...data,
      color: selectedColor,
      description: data.description || undefined // Ensure empty strings become undefined
    }
    console.log('Final submit data:', submitData)
    await onSubmit(submitData)
    onClose()
  }

  const defaultValues: Partial<DeckFormData> = deck ? {
    title: deck.title,
    description: deck.description || '',
    isPublic: deck.isPublic,
  } : {
    title: '',
    description: '',
    isPublic: false,
  }

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView className="flex-1 bg-white">
        <VStack className="flex-1 p-6">
          <HStack className="justify-between items-center mb-6">
            <Text className="text-xl font-bold">
              {deck ? 'Edit Deck' : 'Create New Deck'}
            </Text>
            <Button onPress={onClose} variant="outline" size="sm">
              <ButtonText>Cancel</ButtonText>
            </Button>
          </HStack>

          <VStack className="space-y-4 flex-1">
            <Form
              schema={deckSchema}
              onSubmit={handleSubmit}
              submitText={deck ? 'Save Changes' : 'Create Deck'}
              isLoading={isLoading}
              defaultValues={defaultValues}
            >
              <FormInput
                name="title"
                label="Deck Title"
                placeholder="Enter deck title"
              />

              <FormInput
                name="description"
                label="Description (Optional)"
                placeholder="Enter deck description"
                multiline
                numberOfLines={3}
              />

              <VStack className="space-y-2">
                <Text className="text-sm font-medium text-gray-700">Deck Color</Text>
                <HStack className="flex-wrap gap-3">
                  {DECK_COLORS.map((color) => (
                    <Pressable
                      key={color}
                      onPress={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-gray-400' : 'border-gray-200'
                        }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </HStack>
              </VStack>
            </Form>
          </VStack>
        </VStack>
      </SafeAreaView>
    </Modal>
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
  const { showSuccess, showError } = useToastNotifications()
  const {
    decks,
    isLoading,
    error,
    refetch,
    createDeck,
    updateDeck,
    deleteDeck,
    isCreating,
    isUpdating
  } = useDecks()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null)

  const handleDeckPress = (deckId: string) => {
    router.push(`/deck/${deckId}`)
  }

  const handleCreateDeck = async (data: DeckFormData) => {
    try {
      console.log('Form data received:', data)
      await createDeck(data as DeckCreateInput)
      showSuccess({ title: 'Success', description: 'Deck created successfully!' })
    } catch (err) {
      console.error('Create deck error:', err)
      showError({ title: 'Error', description: 'Failed to create deck' })
    }
  }

  const handleUpdateDeck = async (data: DeckFormData) => {
    if (!editingDeck) return

    try {
      await updateDeck({ id: editingDeck.id, ...data })
      showSuccess({ title: 'Success', description: 'Deck updated successfully!' })
      setEditingDeck(null)
    } catch (err) {
      console.error('Update deck error:', err)
      showError({ title: 'Error', description: 'Failed to update deck' })
    }
  }

  const handleDeleteDeck = (deck: Deck) => {
    Alert.alert(
      'Delete Deck',
      `Are you sure you want to delete "${deck.title}"? This will also delete all cards in this deck. This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeck(deck.id)
              showSuccess({ title: 'Success', description: 'Deck deleted successfully!' })
            } catch (err) {
              console.error('Delete deck error:', err)
              showError({ title: 'Error', description: 'Failed to delete deck' })
            }
          },
        },
      ]
    )
  }

  if (error) {
    return (
      <SafeAreaView className="flex-1">
        <QueryErrorFallback
          error={error as unknown as Error}
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
          <Button
            onPress={() => setShowCreateModal(true)}
            size="sm"
            className="bg-blue-500"
          >
            <PlusIcon size={16} color="white" />
            <ButtonText className="ml-1">New Deck</ButtonText>
          </Button>
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
              <Button
                onPress={() => setShowCreateModal(true)}
                size="lg"
                className="bg-blue-500"
              >
                <PlusIcon size={20} color="white" />
                <ButtonText className="ml-2">Create Your First Deck</ButtonText>
              </Button>
            </Box>
          ) : (
            <ScrollView
              className="flex-1"
              contentContainerStyle={{ padding: 16 }}
              refreshControl={
                <RefreshControl
                  refreshing={isLoading}
                  onRefresh={refetch}
                  colors={['#3b82f6']}
                />
              }
              showsVerticalScrollIndicator={false}
            >
              <Box className="flex-row flex-wrap -m-2">
                {decks?.map((deck) => (
                  <DeckCard
                    key={deck.id}
                    deck={deck}
                    onPress={() => handleDeckPress(deck.id)}
                    onEdit={setEditingDeck}
                    onDelete={handleDeleteDeck}
                  />
                ))}
              </Box>
            </ScrollView>
          )}
        </Box>
      </VStack>

      <DeckFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateDeck}
        isLoading={isCreating}
      />

      <DeckFormModal
        visible={!!editingDeck}
        onClose={() => setEditingDeck(null)}
        onSubmit={handleUpdateDeck}
        deck={editingDeck}
        isLoading={isUpdating}
      />
    </SafeAreaView>
  )
}
