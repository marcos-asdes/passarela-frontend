import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { UseAppHeaderReturn } from '@/components/AppHeader/types'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import {
  logout as logoutAction,
  selectProfileEmail,
  selectProfileError,
  selectProfileLoading,
  selectProfileName
} from '@/store/reducers/auth/slice'
import { fetchProfileThunk, logoutThunk } from '@/store/reducers/auth/thunk'
import type { UserRole } from '@/store/reducers/auth/types'
import { selectRegisteredInterests } from '@/store/reducers/interest/slice'

/**
 * Estado/comportamento do `AppHeader`: nome/e-mail (buscados uma vez via `fetchProfileThunk`, nunca vêm
 * do login), contagem do carrinho (só relevante pro shopper), ocultação ao rolar e logout — tudo
 * escopado ao `role` da página hospedeira (dashboard = merchant, feed = shopper).
 */
export function useAppHeader(role: UserRole): UseAppHeaderReturn {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const name = useAppSelector(selectProfileName(role))
  const email = useAppSelector(selectProfileEmail(role))
  const profileLoading = useAppSelector(selectProfileLoading(role))
  const profileError = useAppSelector(selectProfileError(role))
  const registeredInterests = useAppSelector(selectRegisteredInterests)
  const cartCount = Object.keys(registeredInterests).length

  const [visible, setVisible] = useState<boolean>(true)
  const lastScrollY = useRef<number>(0)

  useEffect(() => {
    // `!profileError` é essencial: sem essa guarda, uma falha (sessão expirada, backend fora) nunca
    // preenche `name` e o efeito dispara de novo a cada re-render — retry infinito martelando a API.
    if (!name && !profileLoading && !profileError) void dispatch(fetchProfileThunk(role))
  }, [dispatch, role, name, profileLoading, profileError])

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
      await dispatch(logoutThunk(role)).unwrap()
    } catch {
      // best-effort: sessão pode já ter expirado no backend — estado local é limpo de todo modo abaixo
    } finally {
      dispatch(logoutAction(role))
      navigate('/')
    }
  }, [dispatch, navigate, role])

  return { visible, name, email, cartCount, handleLogout }
}
