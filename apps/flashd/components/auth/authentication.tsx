import { authClient } from '@/lib/auth'
import { useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

export function Authentication({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter()
    const segments = useSegments()

    useEffect(() => {
        if (isPending) return // Still loading

        const inAuthGroup = segments[0] === '(auth)'

        if (!session) {
            // User is not signed in
            if (!inAuthGroup) {
                // Redirect to sign-in if NOT already in auth group
                router.replace('/(auth)/sign-in')
            }
        } else {
            // User is signed in
            if (inAuthGroup) {
                // Redirect away from auth screens to main app
                router.replace('/(tabs)')
            }
        }
    }, [session, isPending, segments, router])

    // Show loading screen while checking auth
    if (isPending) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return <>{children}</>
}