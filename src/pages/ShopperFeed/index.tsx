import { Alert, Card, Col, Pagination, Row, Spin, Typography } from 'antd'
import type { ReactNode } from 'react'

import { AppHeader } from '@/components/AppHeader'
import { Button } from '@/components/Button'
import * as S from '@/pages/ShopperFeed/styles'
import { useShopperFeed } from '@/pages/ShopperFeed/useShopperFeed'
import { OfferStatus } from '@/store/reducers/offers/types'

/** Feed do shopper: offers ativas paginadas, com registro/remoção de interest em tempo real. */
function ShopperFeed(): ReactNode {
  const {
    loading,
    error,
    pagedOffers,
    totalOffers,
    currentPage,
    pageSize,
    onPageChange,
    registeredInterests,
    pendingOfferIds,
    handleRegisterInterest,
    handleRemoveInterest
  } = useShopperFeed()

  return (
    <S.PageWrapper>
      <AppHeader />
      <S.Content>
        <S.PageTitle>Ofertas relâmpago</S.PageTitle>

        {error && <Alert type="error" showIcon title={error} style={{ marginBottom: 16 }} />}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 48 }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <Row gutter={[16, 16]}>
              {pagedOffers.map((offer) => {
                const hasInterest = !!registeredInterests[offer.id]
                const isPending = pendingOfferIds.includes(offer.id)
                const isSoldOut = offer.status === OfferStatus.SoldOut
                const isExpired = offer.status === OfferStatus.Expired
                const isUnavailable = (isSoldOut || isExpired) && !hasInterest

                let actionButton: ReactNode
                if (hasInterest) {
                  actionButton = (
                    <Button
                      type="default"
                      fullWidth
                      loading={isPending}
                      disabled={isPending}
                      onClick={() => {
                        handleRemoveInterest(offer.id)
                      }}
                    >
                      Retirar interesse
                    </Button>
                  )
                } else if (isExpired) {
                  actionButton = (
                    <Button type="default" fullWidth disabled>
                      Expirado
                    </Button>
                  )
                } else if (isSoldOut) {
                  actionButton = (
                    <Button type="default" fullWidth disabled>
                      Esgotado
                    </Button>
                  )
                } else {
                  actionButton = (
                    <Button
                      type="primary"
                      fullWidth
                      loading={isPending}
                      disabled={isPending}
                      onClick={() => {
                        handleRegisterInterest(offer.id)
                      }}
                    >
                      Tenho interesse
                    </Button>
                  )
                }

                return (
                  <Col xs={24} sm={12} lg={8} xl={6} key={offer.id}>
                    <Card style={{ height: '100%', opacity: isUnavailable ? 0.7 : 1 }}>
                      <Typography.Text strong style={{ fontSize: 15 }}>
                        {offer.title}
                      </Typography.Text>
                      <Typography.Paragraph
                        type="secondary"
                        style={{ marginTop: 6, marginBottom: 0, fontSize: 13 }}
                        ellipsis={{ rows: 2 }}
                      >
                        {offer.description}
                      </Typography.Paragraph>

                      <S.CardMeta>
                        <S.DiscountTag>{offer.discountPercent}% OFF</S.DiscountTag>
                        <S.StockTag>{offer.stock} em estoque</S.StockTag>
                        {isExpired && <S.StatusTag $variant="expired">Expirado</S.StatusTag>}
                        {isSoldOut && !isExpired && <S.StatusTag $variant="soldout">Esgotado</S.StatusTag>}
                      </S.CardMeta>

                      <S.CardActions>{actionButton}</S.CardActions>
                    </Card>
                  </Col>
                )
              })}
            </Row>

            {totalOffers > pageSize && (
              <S.PaginationWrapper>
                <Pagination
                  current={currentPage}
                  total={totalOffers}
                  pageSize={pageSize}
                  onChange={onPageChange}
                  showSizeChanger={false}
                />
              </S.PaginationWrapper>
            )}
          </>
        )}
      </S.Content>
    </S.PageWrapper>
  )
}

export default ShopperFeed
