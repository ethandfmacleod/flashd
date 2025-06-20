import { Box } from '@/components/ui/box'
import { Text } from '@/components/ui/text'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

export default function DecksPage() {
  return (
    <SafeAreaView className="flex-1">
      <Box className="flex-1 justify-center items-center p-6">
        <Text className="text-2xl font-bold">Decks Page</Text>
      </Box>
    </SafeAreaView>
  )
}
