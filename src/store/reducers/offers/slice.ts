import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import { registerInterestThunk, removeInterestThunk } from '@/store/reducers/interest/thunk'
import {
  closeOfferThunk,
  createOfferThunk,
  fetchMyOffersThunk,
  fetchPublicOffersThunk
} from '@/store/reducers/offers/thunk'
import type { IOffer, OffersState } from '@/store/reducers/offers/types'
import { OfferStatus } from '@/store/reducers/offers/types'
import { createBranchSelectors } from '@/utils/redux/createBranchSelectors'

export const initialState: OffersState = {
  mine: { loading: false, error: null, items: [] },
  create: { loading: false, error: null },
  close: { loading: false, error: null },
  public: { loading: false, error: null, items: [] }
}

/** Slice `offers`: `mine` (dashboard), `create`, `close` e `public` (feed) tratados de forma independente. */
const slice = createSlice({
  name: 'offers',
  initialState,
  reducers: {
    /** Prepend de uma offer recebida via WebSocket (`offer:created`) — ignora se já estiver na lista. */
    offerReceived(state, action: PayloadAction<IOffer>) {
      if (!state.public.items.some((item) => item.id === action.payload.id)) state.public.items.unshift(action.payload)
    },
    /**
     * Reage a `offer:status-changed` (encerramento manual ou expiração automática). O feed público
     * nunca traz offers `Closed` (ver `findPublicFeed` no backend) — por isso, ao encerrar, a offer é
     * removida da lista em vez de só ter o status atualizado, senão ficaria com o card sem tag e o
     * botão "Tenho interesse" ainda habilitado.
     */
    offerStatusChanged(state, action: PayloadAction<IOffer>) {
      if (action.payload.status === OfferStatus.Closed) {
        state.public.items = state.public.items.filter((item) => item.id !== action.payload.id)
        return
      }
      const item = state.public.items.find((o) => o.id === action.payload.id)
      if (item) item.status = action.payload.status
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyOffersThunk.pending, (state) => {
        state.mine.loading = true
        state.mine.error = null
      })
      .addCase(fetchMyOffersThunk.fulfilled, (state, action) => {
        state.mine.loading = false
        state.mine.items = action.payload
      })
      .addCase(fetchMyOffersThunk.rejected, (state, action) => {
        state.mine.loading = false
        state.mine.error = action.payload ?? 'Algo deu errado. Tente novamente.'
      })
      .addCase(createOfferThunk.pending, (state) => {
        state.create.loading = true
        state.create.error = null
      })
      .addCase(createOfferThunk.fulfilled, (state, action) => {
        state.create.loading = false
        state.mine.items.unshift({ ...action.payload, interestCount: 0 })
      })
      .addCase(createOfferThunk.rejected, (state, action) => {
        state.create.loading = false
        state.create.error = action.payload ?? 'Algo deu errado. Tente novamente.'
      })
      .addCase(closeOfferThunk.pending, (state) => {
        state.close.loading = true
        state.close.error = null
      })
      .addCase(closeOfferThunk.fulfilled, (state, action) => {
        state.close.loading = false
        const item = state.mine.items.find((offer) => offer.id === action.payload.id)
        if (item) item.status = action.payload.status
      })
      .addCase(closeOfferThunk.rejected, (state, action) => {
        state.close.loading = false
        state.close.error = action.payload ?? 'Algo deu errado. Tente novamente.'
      })
      .addCase(fetchPublicOffersThunk.pending, (state) => {
        state.public.loading = true
        state.public.error = null
      })
      .addCase(fetchPublicOffersThunk.fulfilled, (state, action) => {
        state.public.loading = false
        state.public.items = action.payload
      })
      .addCase(fetchPublicOffersThunk.rejected, (state, action) => {
        state.public.loading = false
        state.public.error = action.payload ?? 'Algo deu errado. Tente novamente.'
      })
      // ── Reação cross-slice: interest confirmado → decrementa estoque imediatamente ──
      .addCase(registerInterestThunk.fulfilled, (state, action) => {
        const item = state.public.items.find((o) => o.id === action.payload.offerId)
        if (item) {
          item.stock = Math.max(0, item.stock - 1)
          if (item.stock === 0) item.status = OfferStatus.SoldOut
        }
      })
      // ── Reação cross-slice: interest removido → devolve estoque imediatamente ──
      .addCase(removeInterestThunk.fulfilled, (state, action) => {
        const item = state.public.items.find((o) => o.id === action.payload)
        if (item) {
          item.stock += 1
          if (item.status === OfferStatus.SoldOut) item.status = OfferStatus.Active
        }
      })
  }
})

const { select } = createBranchSelectors<OffersState>({
  paths: [['offers']],
  fallback: initialState
})

export const { offerReceived, offerStatusChanged } = slice.actions

/** `true` enquanto `fetchMyOffersThunk` está em andamento. */
export const selectMyOffersLoading = select((state) => state.mine.loading)
/** Mensagem de erro da última falha de `fetchMyOffersThunk`, ou `null`. */
export const selectMyOffersError = select((state) => state.mine.error)
/** Offers do merchant autenticado, cada uma com `interestCount`. */
export const selectMyOffers = select((state) => state.mine.items)
/** `true` enquanto `createOfferThunk` está em andamento. */
export const selectCreateOfferLoading = select((state) => state.create.loading)
/** Mensagem de erro da última falha de `createOfferThunk`, ou `null`. */
export const selectCreateOfferError = select((state) => state.create.error)
/** `true` enquanto `closeOfferThunk` está em andamento. */
export const selectCloseOfferLoading = select((state) => state.close.loading)
/** `true` enquanto `fetchPublicOffersThunk` está em andamento. */
export const selectPublicOffersLoading = select((state) => state.public.loading)
/** Mensagem de erro da última falha de `fetchPublicOffersThunk`, ou `null`. */
export const selectPublicOffersError = select((state) => state.public.error)
/** Offers ativas do feed público. */
export const selectPublicOffers = select((state) => state.public.items)

export default slice.reducer
