import { useCallback } from 'react'

import type { RegisterFormProps, RegisterFormValues, UseRegisterFormReturn } from '@/components/RegisterForm/types'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { selectRegisterError, selectRegisterLoading } from '@/store/reducers/auth/slice'
import { registerThunk } from '@/store/reducers/auth/thunk'
import { onlyDigits } from '@/utils/formatters'

/** Estado e submissão do cadastro. Dispara `registerThunk` com o `role` fixo recebido via props. */
export function useRegisterForm({ role, onSuccess }: Readonly<RegisterFormProps>): UseRegisterFormReturn {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectRegisterLoading)
  const error = useAppSelector(selectRegisterError)

  const handleSubmit = useCallback(
    async (values: RegisterFormValues): Promise<void> => {
      const result = await dispatch(
        registerThunk({
          name: values.name,
          email: values.email,
          cpf: onlyDigits(values.cpf),
          phone: onlyDigits(values.phone),
          birthDate: values.birthDate.toDate(),
          password: values.password,
          confirmPassword: values.confirmPassword,
          role
        })
      )
      if (registerThunk.fulfilled.match(result)) onSuccess()
    },
    [dispatch, role, onSuccess]
  )

  return { loading, error, handleSubmit }
}
