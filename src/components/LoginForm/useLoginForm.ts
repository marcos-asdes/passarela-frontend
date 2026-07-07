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
 * Estado e submissão do login. Dispara `loginThunk` com o `role` da página (o backend só busca
 * conta daquele papel), e redireciona pro dashboard/feed correspondente em caso de sucesso.
 */
export function useLoginForm(role: UserRole): UseLoginFormReturn {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const loading = useAppSelector(selectLoginLoading(role))
  const error = useAppSelector(selectLoginError(role))
  const [loggedIn, setLoggedIn] = useState<boolean>(false)

  const handleSubmit = useCallback(
    async (values: LoginFormValues): Promise<void> => {
      const result = await dispatch(loginThunk({ ...values, role }))
      if (loginThunk.fulfilled.match(result)) {
        setLoggedIn(true)
        navigate(POST_LOGIN_PATH[role])
      }
    },
    [dispatch, navigate, role]
  )

  return { loading, error, loggedIn, handleSubmit }
}
