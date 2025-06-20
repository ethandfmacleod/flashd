import { useWindowDimensions } from 'react-native'

interface BreakpointValues<T> {
  base: T
  sm?: T
  md?: T
  lg?: T
  xl?: T
}

const breakpoints = {
  sm: 480,
  md: 768,
  lg: 992,
  xl: 1280,
}

export function useBreakpointValue<T>(values: BreakpointValues<T>): T {
  const { width } = useWindowDimensions()

  if (width >= breakpoints.xl && values.xl !== undefined) {
    return values.xl
  }
  if (width >= breakpoints.lg && values.lg !== undefined) {
    return values.lg
  }
  if (width >= breakpoints.md && values.md !== undefined) {
    return values.md
  }
  if (width >= breakpoints.sm && values.sm !== undefined) {
    return values.sm
  }

  return values.base
}
