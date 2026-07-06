import type { ReactNode } from 'react'
import { ShopOutlined, UserOutlined } from '@ant-design/icons'
import { Col, Row, Typography } from 'antd'

import { PersonaCard } from '@/components/PersonaCard'
import * as S from '@/pages/Landing/styles'

/** Landing page: apresenta o Passarela e direciona lojista/cliente para login ou cadastro. */
function Landing(): ReactNode {
  return (
    <S.Page>
      <S.Hero>
        <Typography.Title level={1} style={{ color: 'inherit' }}>
          Passarela
        </Typography.Title>
        <Typography.Paragraph type="secondary" style={{ fontSize: 18, maxWidth: 560, margin: '0 auto' }}>
          Ofertas relâmpago em tempo real das lojas do seu shopping. Lojistas publicam ofertas, clientes acompanham ao
          vivo.
        </Typography.Paragraph>
      </S.Hero>
      <S.Content>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={12}>
            <PersonaCard
              icon={<ShopOutlined />}
              title="Sou lojista"
              description="Publique ofertas relâmpago e alcance compradores do seu shopping em tempo real."
              loginTo="/lojista/entrar"
              registerTo="/lojista/cadastro"
            />
          </Col>
          <Col xs={24} sm={12}>
            <PersonaCard
              icon={<UserOutlined />}
              title="Sou cliente"
              description="Acompanhe ofertas relâmpago das suas lojas favoritas e demonstre interesse na hora."
              loginTo="/cliente/entrar"
              registerTo="/cliente/cadastro"
            />
          </Col>
        </Row>
      </S.Content>
    </S.Page>
  )
}

export default Landing
