import type { ReactNode } from 'react'
import { Space, Typography } from 'antd'

import { Button } from '@/components/Button'
import * as S from '@/components/PersonaCard/styles'
import type { PersonaCardProps } from '@/components/PersonaCard/types'
import { usePersonaCard } from '@/components/PersonaCard/usePersonaCard'

/** Card de persona da landing page: título, descrição e atalhos de login/cadastro. */
export function PersonaCard({ icon, title, description, loginTo, registerTo }: Readonly<PersonaCardProps>): ReactNode {
  const { handleLoginClick, handleRegisterClick } = usePersonaCard(loginTo, registerTo)

  return (
    <S.StyledCard>
      <S.IconWrapper>{icon}</S.IconWrapper>
      <Typography.Title level={3}>{title}</Typography.Title>
      <Typography.Paragraph type="secondary">{description}</Typography.Paragraph>
      <Space orientation="vertical" style={{ width: '100%' }} size={12}>
        <Button type="primary" fullWidth onClick={handleLoginClick}>
          Entrar
        </Button>
        <Button fullWidth onClick={handleRegisterClick}>
          Cadastrar
        </Button>
      </Space>
    </S.StyledCard>
  )
}
