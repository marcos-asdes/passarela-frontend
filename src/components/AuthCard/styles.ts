import { Card } from 'antd'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

export const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.background};
  padding: 24px;
`

export const StyledCard = styled(Card)`
  width: 100%;
  max-width: 440px;
`

export const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
`

export const Footer = styled.div`
  margin-top: 24px;
  text-align: center;
`
