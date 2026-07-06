import type { ReactNode } from 'react'

import * as S from '@/components/Button/styles'
import type { ButtonProps } from '@/components/Button/types'

/** Botão padrão da aplicação — wrapper sobre o antd Button usado em todas as páginas. */
export function Button({ fullWidth, ...props }: Readonly<ButtonProps>): ReactNode {
  return <S.StyledButton $fullWidth={fullWidth} {...props} />
}
