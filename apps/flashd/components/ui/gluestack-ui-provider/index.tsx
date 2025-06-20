import { OverlayProvider } from '@gluestack-ui/overlay'
import { ToastProvider } from '@gluestack-ui/toast'
import React from 'react'
import { View, ViewProps } from 'react-native'

export type ModeType = 'light' | 'dark' | 'system'

export function GluestackUIProvider({
  mode = 'light',
  children,
  ...props
}: {
  mode?: ModeType
  children?: React.ReactNode
  style?: ViewProps['style']
}) {
  return (
    <View style={[{ flex: 1 }, props.style]}>
      <OverlayProvider>
        <ToastProvider>{children}</ToastProvider>
      </OverlayProvider>
    </View>
  )
}
