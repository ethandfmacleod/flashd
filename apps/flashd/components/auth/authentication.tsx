import { authClient } from '@/lib/auth'
import { useRouter, useSegments } from 'expo-router'
import { useEffect } from 'react'
import { ActivityIndicator, View } from 'react-native'

export function Authentication({ children }: { children: React.ReactNode }) {
    const { data: session, isPending } = authClient.useSession()
    const router = useRouter()
    const segments = useSegments()

    useEffect(() => {
        if (isPending) return
        const inAuthGroup = segments[0] === '(auth)'
        if (!session) {
            if (!inAuthGroup) router.replace('/(auth)/sign-in')
        } else {
            if (inAuthGroup) {
                router.replace('/(tabs)')
            }
        }
    }, [session, isPending, segments, router])

    if (isPending) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        )
    }

    return <>{children}</>
}