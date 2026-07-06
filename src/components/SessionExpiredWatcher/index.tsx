import { App } from 'antd'
import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { setSessionExpiredHandler } from '@/services/api/sessionExpiry'
import { persistor } from '@/store'
import { logout } from '@/store/reducers/auth/slice'

/**
 * Componente sem renderização — registra o handler global acionado pelo interceptor de 401
 * (`services/api/interceptors/sessionExpired.interceptor.ts`) via `services/api/sessionExpiry.ts`.
 * Precisa estar montado dentro de `BrowserRouter`+`Provider` (usa `useNavigate`/`useAppDispatch`), por
 * isso vive como componente em vez de lógica solta em `store/index.ts`. Usa `App.useApp().modal`, não o
 * `Modal` estático — o estático não consome o contexto de tema do `AntApp` (ver `App.tsx`) e renderiza invisível.
 */
export function SessionExpiredWatcher(): ReactNode {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { modal } = App.useApp()
  const alreadyShownRef = useRef<boolean>(false)

  useEffect(() => {
    setSessionExpiredHandler(() => {
      // Várias requests podem 401 quase juntas (perfil, feed, interesses) — sem essa guarda cada
      // uma abriria seu próprio modal, empilhando várias cópias na tela.
      if (alreadyShownRef.current) return
      alreadyShownRef.current = true

      modal.info({
        title: 'Sessão expirada',
        content: 'Sua sessão expirou por inatividade. Faça login novamente.',
        okText: 'OK',
        onOk: () => {
          alreadyShownRef.current = false
          dispatch(logout())
          persistor.purge()
          navigate('/')
        }
      })
    })

    return () => setSessionExpiredHandler(null)
  }, [dispatch, navigate, modal])

  return null
}
