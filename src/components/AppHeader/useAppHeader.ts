import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { UseAppHeaderReturn } from '@/components/AppHeader/types'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { persistor } from '@/store'
import {
  logout as logoutAction,
  selectLoginUser,
  selectProfileEmail,
  selectProfileError,
  selectProfileLoading,
  selectProfileName
} from '@/store/reducers/auth/slice'
import { fetchProfileThunk, logoutThunk } from '@/store/reducers/auth/thunk'
import { selectRegisteredInterests } from '@/store/reducers/interest/slice'

/**
 * Estado/comportamento do `AppHeader`: nome/e-mail (buscados uma vez via `fetchProfileThunk`, nunca vêm
 * do login), contagem do carrinho (só relevante pro shopper), ocultação ao rolar e logout.
 */
export function useAppHeader(): UseAppHeaderReturn {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const user = useAppSelector(selectLoginUser)
  const name = useAppSelector(selectProfileName)
  const email = useAppSelector(selectProfileEmail)
  const profileLoading = useAppSelector(selectProfileLoading)
  const profileError = useAppSelector(selectProfileError)
  const registeredInterests = useAppSelector(selectRegisteredInterests)
  const cartCount = Object.keys(registeredInterests).length

  const [visible, setVisible] = useState<boolean>(true)
  const lastScrollY = useRef<number>(0)

  useEffect(() => {
    // `!profileError` é essencial: sem essa guarda, uma falha (sessão expirada, backend fora) nunca
    // preenche `name` e o efeito dispara de novo a cada re-render — retry infinito martelando a API.
    if (!name && !profileLoading && !profileError) void dispatch(fetchProfileThunk())
  }, [dispatch, name, profileLoading, profileError])

  useEffect(() => {
    let ticking = false
    const handleScroll = (): void => {
      if (ticking) return
      ticking = true
      requestAnimationFrame(() => {
        const currentY = window.scrollY
        if (currentY > lastScrollY.current && currentY > 80) setVisible(false)
        else setVisible(true)

        lastScrollY.current = currentY
        ticking = false
      })
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = useCallback(async (): Promise<void> => {
    try {
      await dispatch(logoutThunk()).unwrap()
    } catch {
      // best-effort: sessão pode já ter expirado no backend — estado local é limpo de todo modo abaixo
    } finally {
      dispatch(logoutAction())
      await persistor.purge()
      navigate('/')
    }
  }, [dispatch, navigate])

  return { visible, name, email, role: user?.role ?? null, cartCount, handleLogout }
}
