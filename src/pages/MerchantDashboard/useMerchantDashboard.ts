import { useCallback, useEffect, useState } from 'react'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import type { CreateOfferFormValues, UseMerchantDashboardReturn } from '@/pages/MerchantDashboard/types'
import { createMerchantSocket } from '@/services/socket/merchantSocket'
import { selectLoginUser } from '@/store/reducers/auth/slice'
import {
  selectCloseOfferLoading,
  selectCreateOfferError,
  selectCreateOfferLoading,
  selectMyOffers,
  selectMyOffersError,
  selectMyOffersLoading
} from '@/store/reducers/offers/slice'
import { closeOfferThunk, createOfferThunk, fetchMyOffersThunk } from '@/store/reducers/offers/thunk'

/**
 * Dashboard do merchant: busca as offers próprias no mount, cria/encerra offers, e conecta ao
 * WebSocket pra refletir em tempo real mudanças de status (encerrada/expirada) e contagem de
 * interest — sem isso, o dashboard só atualizava com um reload manual da página.
 */
export function useMerchantDashboard(): UseMerchantDashboardReturn {
  const dispatch = useAppDispatch()
  const merchant = useAppSelector(selectLoginUser)
  const loading = useAppSelector(selectMyOffersLoading)
  const error = useAppSelector(selectMyOffersError)
  const offers = useAppSelector(selectMyOffers)
  const createLoading = useAppSelector(selectCreateOfferLoading)
  const createError = useAppSelector(selectCreateOfferError)
  const closeLoading = useAppSelector(selectCloseOfferLoading)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  useEffect(() => {
    dispatch(fetchMyOffersThunk())
  }, [dispatch])

  useEffect(() => {
    if (!merchant) return

    const socket = createMerchantSocket(merchant.id)
    const refetch = (): void => {
      void dispatch(fetchMyOffersThunk())
    }
    socket.on('offer:updated', refetch)
    socket.on('offer:interest-changed', refetch)

    return () => {
      socket.disconnect()
    }
  }, [dispatch, merchant])

  const handleSoftReload = useCallback((): void => {
    void dispatch(fetchMyOffersThunk())
  }, [dispatch])

  const handleOpenModal = useCallback((): void => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback((): void => {
    setIsModalOpen(false)
  }, [])

  const handleCreateSubmit = useCallback(
    async (values: CreateOfferFormValues): Promise<void> => {
      const result = await dispatch(
        createOfferThunk({
          title: values.title,
          description: values.description,
          discountPercent: values.discountPercent,
          stock: values.stock,
          validUntil: values.validUntil.toISOString()
        })
      )
      if (createOfferThunk.fulfilled.match(result)) setIsModalOpen(false)
    },
    [dispatch]
  )

  const handleClose = useCallback(
    async (offerId: string): Promise<void> => {
      await dispatch(closeOfferThunk(offerId))
    },
    [dispatch]
  )

  return {
    loading,
    error,
    offers,
    isModalOpen,
    createLoading,
    createError,
    closeLoading,
    handleOpenModal,
    handleCloseModal,
    handleCreateSubmit,
    handleClose,
    handleSoftReload
  }
}
