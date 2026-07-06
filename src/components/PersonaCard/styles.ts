import { Card } from 'antd'
import styled from 'styled-components'

export const StyledCard = styled(Card)`
  text-align: center;
  height: 100%;
`

export const IconWrapper = styled.div`
  font-size: 40px;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 8px;
`
