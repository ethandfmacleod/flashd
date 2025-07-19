import { DesktopSidebar } from '@/components/navigation/DesktopSidebar'
import { MobileBottomTabs } from '@/components/navigation/MobileBottomTabs'
import { Box } from '@/components/ui/box'
import { useBreakpointValue } from '@/hooks/useBreakpointValue'
import { Stack } from 'expo-router'
import React from 'react'
import '../../global.css'

export default function TabsLayout() {
  const showSidebar = useBreakpointValue({ base: false, md: true })

  if (showSidebar) {
    return (
      <Box className="flex-1 flex-row">
        <DesktopSidebar />
        <Box className="flex-1">
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="decks" />
            <Stack.Screen name="profile" />
            <Stack.Screen name="settings" />
          </Stack>
        </Box>
      </Box>
    )
  }

  return (
    <Box className="flex-1">
      <Box className="flex-1">
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="decks" />
          <Stack.Screen name="profile" />
          <Stack.Screen name="settings" />
        </Stack>
      </Box>
      <MobileBottomTabs />
    </Box>
  )
}
