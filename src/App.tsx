import type { ReactNode } from 'react'
import { App as AntApp, ConfigProvider } from 'antd'
import ptBR from 'antd/locale/pt_BR'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { PersistGate } from 'redux-persist/integration/react'
import { ThemeProvider } from 'styled-components'

import { antdTheme } from '@/antdTheme'
import { LoadingFallback } from '@/components/LoadingFallback'
import { SessionExpiredWatcher } from '@/components/SessionExpiredWatcher'
import { Routes } from '@/routes/Routes'
import store, { persistor } from '@/store'
import { theme } from '@/theme'

dayjs.extend(customParseFormat)
dayjs.locale('pt-br')

/**
 * Composição raiz: roteador, Redux, tema do antd e do styled-components, nessa ordem de dependência.
 * `AntApp` (antd) dá contexto de tema pras funções estáticas `message`/`notification`/`Modal`.
 */
function App(): ReactNode {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ConfigProvider locale={ptBR} theme={antdTheme}>
          <ThemeProvider theme={theme}>
            <AntApp>
              <SessionExpiredWatcher />
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
