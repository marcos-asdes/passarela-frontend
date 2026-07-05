import 'styled-components'
import type { AppTheme } from '@/theme'

declare module 'styled-components' {
  export type DefaultTheme = AppTheme
}
