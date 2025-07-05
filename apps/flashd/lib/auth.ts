import { expoClient } from '@better-auth/expo/client'
import { createAuthClient } from 'better-auth/react'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const createStorage = () => {
  if (Platform.OS === 'web') {
    return {
      getItem: (key: string) => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key)
        }
        return null
      },
      setItem: (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value)
        }
      },
      deleteItem: (key: string) => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key)
        }
      },
      getValueWithKeySync: (key: string) => {
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key)
        }
        return null
      },
      setValueWithKeyAsync: async (key: string, value: string) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value)
        }
      },
      deleteValueWithKeyAsync: async (key: string) => {
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key)
        }
      },
    }
  } else {
    return SecureStore
  }
}

export const authClient = createAuthClient({
  baseURL: (process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:3000') + '/api/auth',
  plugins: [
    expoClient({
      scheme: 'flashd',
      storagePrefix: 'flashd',
      storage: createStorage(),
    }),
  ],
})

export const { useSession, signIn, signUp, signOut } = authClient
