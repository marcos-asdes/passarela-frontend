import { ShoppingCartOutlined } from '@ant-design/icons'
import { Badge, Tooltip } from 'antd'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import * as S from '@/components/AppHeader/styles'
import { Button } from '@/components/Button'
import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import { persistor } from '@/store'
import { logout } from '@/store/reducers/auth/slice'
import { selectRegisteredInterests } from '@/store/reducers/interest/slice'

/** Header fixo com ocultação suave ao rolar para baixo e reaparecimento ao rolar para cima. */
export function AppHeader(): ReactNode {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const registeredInterests = useAppSelector(selectRegisteredInterests)
  const cartCount = Object.keys(registeredInterests).length

  const [visible, setVisible] = useState(true)
  const lastScrollY = useRef(0)

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

  const handleLogout = (): void => {
    dispatch(logout())
    persistor.purge()
    navigate('/')
  }

  return (
    <S.HeaderWrapper $visible={visible}>
      <S.Inner>
        <S.Logo>Passarela</S.Logo>

        <S.Actions>
          <S.Greeting>Olá, comprador!</S.Greeting>

          <Tooltip
            title={`${cartCount} interesse${cartCount === 1 ? '' : 's'} registrado${cartCount === 1 ? '' : 's'}`}
          >
            <Badge count={cartCount} size="small" color="#D32F2F">
              <Button
                icon={<ShoppingCartOutlined />}
                type="text"
                style={{ fontSize: 20, color: '#1A1A1A', padding: '0 8px' }}
                aria-label="Interesses registrados"
              />
            </Badge>
          </Tooltip>

          <Button type="default" onClick={handleLogout}>
            Sair
          </Button>
        </S.Actions>
      </S.Inner>
    </S.HeaderWrapper>
  )
}
