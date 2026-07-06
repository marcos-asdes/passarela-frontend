/**
 * Identidade visual inspirada no case Komfy (Behance): vermelho como cor de marca, tipografia
 * Poppins, botões em formato pill. Compartilhado entre o `ConfigProvider` do antd e o
 * `ThemeProvider` do styled-components.
 */
export const theme = {
  colors: {
    primary: '#D32F2F',
    primaryHover: '#C62828',
    primaryActive: '#B71C1C',
    black: '#000000',
    white: '#FFFFFF',
    text: '#1A1A1A',
    textSecondary: '#6B6B6B',
    background: '#F7F7F7',
    surface: '#FFFFFF',
    border: '#E5E5E5',
    danger: '#D32F2F'
  },
  font: {
    family: "'Poppins', sans-serif",
    weightRegular: 400,
    weightMedium: 500,
    weightSemibold: 600
  },
  radius: {
    button: 999,
    card: 20,
    input: 12
  }
}

export type AppTheme = typeof theme
