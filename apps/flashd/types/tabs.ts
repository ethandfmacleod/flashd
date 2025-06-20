import { type LucideIcon } from 'lucide-react-native'

export type TabKey = 'Home' | 'Decks' | 'Profile' | 'Settings'
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>

export interface TabType {
  icon: LucideIcon
  label: TabKey
  name: string
  route: string
}
