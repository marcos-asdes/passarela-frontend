import { Button as AntButton } from 'antd'
import styled from 'styled-components'

export const StyledButton = styled(AntButton)<{ $fullWidth?: boolean }>`
  ${({ $fullWidth }) => $fullWidth && 'width: 100%;'}
`
