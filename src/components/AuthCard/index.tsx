import type { ReactNode } from 'react'
import { Typography } from 'antd'

import * as S from '@/components/AuthCard/styles'
import type { AuthCardProps } from '@/components/AuthCard/types'

/** Chrome compartilhado das páginas de autenticação: card centralizado com título, formulário e rodapé. */
export function AuthCard({ title, subtitle, children, footer }: Readonly<AuthCardProps>): ReactNode {
  return (
    <S.Page>
      <S.StyledCard>
        <S.BackLink to="/">← Voltar para o Passarela</S.BackLink>
        <Typography.Title level={2}>{title}</Typography.Title>
        {subtitle && <Typography.Paragraph type="secondary">{subtitle}</Typography.Paragraph>}
        {children}
        {footer && <S.Footer>{footer}</S.Footer>}
      </S.StyledCard>
    </S.Page>
  )
}
