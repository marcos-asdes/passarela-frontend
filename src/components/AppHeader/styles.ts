import styled, { css } from 'styled-components'

export const HeaderWrapper = styled.header<{ $visible: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  background: ${({ theme }) => theme.colors.surface};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: transform 0.3s ease;

  ${({ $visible }) =>
    !$visible &&
    css`
      transform: translateY(-100%);
    `}
`

export const Inner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`

export const Logo = styled.span`
  font-size: 22px;
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  color: ${({ theme }) => theme.colors.primary};
  letter-spacing: -0.5px;
  cursor: default;
  user-select: none;
`

export const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`

export const GreetingBlock = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  line-height: 1.25;
  margin-right: 4px;
`

export const GreetingName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text};
  font-weight: ${({ theme }) => theme.font.weightMedium};
  white-space: nowrap;
`

export const GreetingEmail = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  white-space: nowrap;
`
