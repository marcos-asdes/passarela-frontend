import { ConfigProvider } from 'antd'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from 'styled-components'

import { Routes } from '@/routes/Routes'
import store from '@/store'
import { theme } from '@/theme'

/** Composição raiz: roteador, Redux, tema do antd e do styled-components, nessa ordem de dependência. */
function App() {
  return (
    <BrowserRouter>
      <Provider store={store}>
        <ConfigProvider theme={{ token: { colorPrimary: theme.colors.primary } }}>
          <ThemeProvider theme={theme}>
            <Routes />
          </ThemeProvider>
        </ConfigProvider>
      </Provider>
    </BrowserRouter>
  )
}

export default App
