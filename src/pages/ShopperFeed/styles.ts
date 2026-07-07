import { Card } from 'antd'
import styled from 'styled-components'

export const PageWrapper = styled.div`
  min-height: calc(100vh - 64px); /* 64px = altura do AppHeader fixo, já compensada pelo padding-top abaixo */
  background: ${({ theme }) => theme.colors.background};
  padding-top: 64px;
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

export const OfferCard = styled(Card)`
  height: 100%;

  .ant-card-body {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
`

export const OfferDescription = styled.p`
  height: 40px; /* 2 linhas de 13px/1.54, mesma altura em todo card pra alinhar os botões */
  margin: 6px 0 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
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
  margin-top: auto;
  padding-top: 16px;
`

export const PaginationWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 32px;
`
