import type { ReactNode } from 'react'
import { App as AntApp, ConfigProvider } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from 'styled-components'

import { LoadingFallback } from '@/components/LoadingFallback'
import { Routes } from '@/routes/Routes'
import store, { persistor } from '@/store'
import { theme } from '@/theme'

dayjs.locale('pt-br')

/**
 * Composição raiz: roteador, Redux, tema do antd e do styled-components, nessa ordem de dependência.
 * `AntApp` (antd) dá contexto de tema pras funções estáticas `message`/`notification`/`Modal`.
 */
function App(): ReactNode {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ConfigProvider
          locale={ptBR}
          theme={{
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
          }}
        >
          <ThemeProvider theme={theme}>
            <AntApp>
              <PersistGate persistor={persistor} loading={<LoadingFallback />}>
                <Routes />
              </PersistGate>
            </AntApp>
          </ThemeProvider>
        </ConfigProvider>
      </Provider>
    </BrowserRouter>
  )
}

export default App
