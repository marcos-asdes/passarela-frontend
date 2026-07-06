import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { LoginFormValues, UseLoginFormReturn } from '@/components/LoginForm/types'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectLoginError, selectLoginLoading } from '@/store/reducers/auth/slice'
import { loginThunk } from '@/store/reducers/auth/thunk'
import { UserRole } from '@/store/reducers/auth/types'

/** Rota pós-login de cada papel — dashboard do merchant, feed do shopper. */
const POST_LOGIN_PATH: Record<UserRole, string> = {
  [UserRole.Merchant]: '/lojista/painel',
  [UserRole.Shopper]: '/cliente/ofertas'
}

/**
 * Estado e submissão do login. Dispara `loginThunk`, confere se o papel devolvido pelo backend
 * bate com a persona da página (já que `POST /auth/login` não recebe role) e redireciona pro
 * dashboard/feed correspondente.
 */
export function useLoginForm(role: UserRole): UseLoginFormReturn {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loading = useAppSelector(selectLoginLoading)
  const error = useAppSelector(selectLoginError)
  const [roleMismatch, setRoleMismatch] = useState<boolean>(false)
  const [loggedIn, setLoggedIn] = useState<boolean>(false)

  const handleSubmit = useCallback(
    async (values: LoginFormValues): Promise<void> => {
      setRoleMismatch(false)
      const result = await dispatch(loginThunk(values))
      if (loginThunk.fulfilled.match(result)) {
        if (result.payload.user.role !== role) {
          setRoleMismatch(true)
          return
        }
        setLoggedIn(true)
        navigate(POST_LOGIN_PATH[role])
      }
    },
    [dispatch, navigate, role]
  )

  return { loading, error, roleMismatch, loggedIn, handleSubmit }
}
