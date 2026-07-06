import { App } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import type { UseShopperFeedReturn } from '@/pages/ShopperFeed/types'
import { createOffersSocket } from '@/services/socket/offersSocket'
import {
  selectFetchInterestLoading,
  selectPendingOfferIds,
  selectRegisteredInterests
} from '@/store/reducers/interest/slice'
import { fetchMyInterestsThunk, registerInterestThunk, removeInterestThunk } from '@/store/reducers/interest/thunk'
import {
  offerReceived,
  selectPublicOffers,
  selectPublicOffersError,
  selectPublicOffersLoading
} from '@/store/reducers/offers/slice'
import { fetchPublicOffersThunk } from '@/store/reducers/offers/thunk'
import type { IOffer } from '@/store/reducers/offers/types'

const PAGE_SIZE = 8

/** Feed do shopper: busca offers ativas e interests do shopper no mount; conecta ao WebSocket pra receber offers novas em tempo real. */
export function useShopperFeed(): UseShopperFeedReturn {
  const dispatch = useAppDispatch()
  const { notification } = App.useApp()

  const offersLoading = useAppSelector(selectPublicOffersLoading)
  const fetchInterestLoading = useAppSelector(selectFetchInterestLoading)
  const loading = offersLoading || fetchInterestLoading

  const error = useAppSelector(selectPublicOffersError)
  const offers = useAppSelector(selectPublicOffers)
  const registeredInterests = useAppSelector(selectRegisteredInterests)
  const pendingOfferIds = useAppSelector(selectPendingOfferIds)

  const [currentPage, setCurrentPage] = useState(1)
  const [showOnlyInterests, setShowOnlyInterests] = useState<boolean>(false)

  useEffect(() => {
    dispatch(fetchPublicOffersThunk())
    dispatch(fetchMyInterestsThunk())
  }, [dispatch])

  useEffect(() => {
    const socket = createOffersSocket()
    socket.on('offer:created', (offer: IOffer) => {
      dispatch(offerReceived(offer))
      notification.info({ message: 'Nova oferta!', description: offer.title })
    })
    return () => {
      socket.disconnect()
    }
  }, [dispatch, notification])

  const handleRegisterInterest = useCallback(
    async (offerId: string): Promise<void> => {
      await dispatch(registerInterestThunk(offerId))
    },
    [dispatch]
  )

  const handleRemoveInterest = useCallback(
    async (offerId: string): Promise<void> => {
      await dispatch(removeInterestThunk(offerId))
    },
    [dispatch]
  )

  const handleToggleCartFilter = useCallback((): void => {
    setShowOnlyInterests((current) => !current)
    setCurrentPage(1)
  }, [])

  const handleSoftReload = useCallback((): void => {
    void dispatch(fetchPublicOffersThunk())
    void dispatch(fetchMyInterestsThunk())
  }, [dispatch])

  const visibleOffers = showOnlyInterests ? offers.filter((offer) => !!registeredInterests[offer.id]) : offers
  const totalOffers = visibleOffers.length
  const start = (currentPage - 1) * PAGE_SIZE
  const pagedOffers = visibleOffers.slice(start, start + PAGE_SIZE)

  return {
    loading,
    error,
    pagedOffers,
    totalOffers,
    currentPage,
    pageSize: PAGE_SIZE,
    onPageChange: setCurrentPage,
    registeredInterests,
    pendingOfferIds,
    showOnlyInterests,
    handleRegisterInterest,
    handleRemoveInterest,
    handleToggleCartFilter,
    handleSoftReload
  }
}
