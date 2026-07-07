import { App } from 'antd'
import { useEffect, useRef, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { setSessionExpiredHandler } from '@/services/api/sessionExpiry'
import { logout } from '@/store/reducers/auth/slice'
import { UserRole } from '@/store/reducers/auth/types'

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
  const alreadyShownRef = useRef<Record<UserRole, boolean>>({
    [UserRole.Merchant]: false,
    [UserRole.Shopper]: false
  })

  useEffect(() => {
    setSessionExpiredHandler((role) => {
      // Várias requests do mesmo papel podem 401 quase juntas (perfil, feed, interesses) — sem essa
      // guarda cada uma abriria seu próprio modal, empilhando várias cópias na tela. Guardado por
      // papel: o outro papel pode expirar em separado sem ser suprimido por essa checagem.
      if (alreadyShownRef.current[role]) return
      alreadyShownRef.current[role] = true

      modal.info({
        title: 'Sessão expirada',
        content: 'Sua sessão expirou por inatividade. Faça login novamente.',
        okText: 'OK',
        onOk: () => {
          alreadyShownRef.current[role] = false
          dispatch(logout(role))
          navigate('/')
        }
      })
    })

    return () => setSessionExpiredHandler(null)
  }, [dispatch, navigate, modal])

  return null
}
