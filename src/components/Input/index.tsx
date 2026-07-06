import type { ReactNode } from 'react'
import { Input as AntInput, type InputProps } from 'antd'

import type { PasswordInputProps } from '@/components/Input/types'

/** Campo de texto padrão da aplicação — wrapper sobre o antd Input usado em todos os formulários. */
export function TextInput(props: Readonly<InputProps>): ReactNode {
  return <AntInput {...props} />
}

/** Campo de senha padrão da aplicação — wrapper sobre o antd Input.Password. */
export function PasswordInput(props: PasswordInputProps): ReactNode {
  return <AntInput.Password {...props} />
}
