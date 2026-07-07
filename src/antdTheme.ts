import type { ThemeConfig } from 'antd'

import { theme } from '@/theme'

/** Mapeia o design token compartilhado (`theme.ts`) pro shape de tema do `ConfigProvider` do antd. */
export const antdTheme: ThemeConfig = {
  token: {
    colorPrimary: theme.colors.primary,
    colorText: theme.colors.text,
    colorTextSecondary: theme.colors.textSecondary,
    colorBorder: theme.colors.border,
    colorBgLayout: theme.colors.background,
    fontFamily: theme.font.family,
    borderRadius: theme.radius.input
  },
  components: {
    Button: { borderRadius: theme.radius.button, controlHeight: 44, fontWeight: theme.font.weightMedium },
    Input: { borderRadius: theme.radius.input, controlHeight: 44 },
    Card: { borderRadiusLG: theme.radius.card }
  }
}
