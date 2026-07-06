import { ShoppingCartOutlined } from '@ant-design/icons'
import { Badge, Tooltip } from 'antd'
import type { ReactNode } from 'react'

import * as S from '@/components/AppHeader/styles'
import { useAppHeader } from '@/components/AppHeader/useAppHeader'
import { Button } from '@/components/Button'
import { UserRole } from '@/store/reducers/auth/types'

/** Header fixo com ocultação suave ao rolar para baixo e reaparecimento ao rolar para cima. */
export function AppHeader(): ReactNode {
  const { visible, name, email, role, cartCount, handleLogout } = useAppHeader()

  return (
    <S.HeaderWrapper $visible={visible}>
      <S.Inner>
        <S.Logo>Passarela</S.Logo>

        <S.Actions>
          <S.GreetingBlock>
            <S.GreetingName>Olá, {name ?? '...'}</S.GreetingName>
            {email && <S.GreetingEmail>{email}</S.GreetingEmail>}
          </S.GreetingBlock>

          {role === UserRole.Shopper && (
            <Tooltip
              title={`${cartCount} interesse${cartCount === 1 ? '' : 's'} registrado${cartCount === 1 ? '' : 's'}`}
            >
              <Badge count={cartCount} size="small" color="#D32F2F" offset={[-6, 6]}>
                <Button
                  icon={<ShoppingCartOutlined />}
                  type="text"
                  style={{ fontSize: 20, color: '#1A1A1A', padding: '0 8px' }}
                  aria-label="Interesses registrados"
                />
              </Badge>
            </Tooltip>
          )}

          <Button
            type="default"
            onClick={() => {
              void handleLogout()
            }}
          >
            Sair
          </Button>
        </S.Actions>
      </S.Inner>
    </S.HeaderWrapper>
  )
}
