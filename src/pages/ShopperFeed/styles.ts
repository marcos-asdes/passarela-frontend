import styled from 'styled-components'

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.background};
  padding-top: 64px; /* altura do AppHeader fixo */
`

export const Content = styled.main`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px 48px;
`

export const PageTitle = styled.h1`
  font-size: 26px;
  font-weight: ${({ theme }) => theme.font.weightSemibold};
  color: ${({ theme }) => theme.colors.text};
  margin: 0 0 24px;
`

export const CardMeta = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
  flex-wrap: wrap;
`

export const DiscountTag = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: #fff3f3;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.font.weightSemibold};
`

export const StockTag = styled.span`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: #f0f0f0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: ${({ theme }) => theme.font.weightMedium};
`

export const StatusTag = styled.span<{ $variant: 'expired' | 'soldout' }>`
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: ${({ theme }) => theme.font.weightMedium};
  background: ${({ $variant }) => ($variant === 'expired' ? '#fff8e1' : '#fce4ec')};
  color: ${({ $variant }) => ($variant === 'expired' ? '#f57f17' : '#c62828')};
`

export const CardActions = styled.div`
  margin-top: 16px;
`

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
`
