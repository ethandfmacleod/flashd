import { TabType } from '@/types/tabs'
import { Home, Layers, Settings, User } from 'lucide-react-native'

export const tabs: TabType[] = [
  { name: 'index', label: 'Home', icon: Home, route: '/(tabs)/' },
  { name: 'decks', label: 'Decks', icon: Layers, route: '/(tabs)/decks' },
  { name: 'profile', label: 'Profile', icon: User, route: '/(tabs)/profile' },
  { name: 'settings', label: 'Settings', icon: Settings, route: '/(tabs)/settings' },
] as const
