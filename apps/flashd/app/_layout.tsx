import { Authentication } from '@/components/auth/authentication'
import { GluestackUIProvider } from '@/components/ui/gluestack-ui-provider'
import { TRPCProvider } from '@/lib/trpc'
import { Stack } from 'expo-router'
import { SafeAreaProvider } from 'react-native-safe-area-context'

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <GluestackUIProvider>
        <TRPCProvider>
          <Authentication>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(auth)" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="index" options={{ headerShown: false }} />
            </Stack>
          </Authentication>
        </TRPCProvider>
      </GluestackUIProvider>
    </SafeAreaProvider >
  )
}
