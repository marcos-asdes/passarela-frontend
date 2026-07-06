import { createSlice } from '@reduxjs/toolkit'

import { fetchMyInterestsThunk, registerInterestThunk, removeInterestThunk } from '@/store/reducers/interest/thunk'
import type { InterestState } from '@/store/reducers/interest/types'
import { createBranchSelectors } from '@/utils/redux/createBranchSelectors'

export const initialState: InterestState = {
  fetchLoading: false,
  pendingOfferIds: [],
  error: null,
  registeredInterests: {}
}

/** Slice `interest`: registro e remoção de interest do shopper autenticado, com loading por card. */
const slice = createSlice({
  name: 'interest',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // ── fetchMyInterests ─────────────────────────────────────────
      .addCase(fetchMyInterestsThunk.pending, (state) => {
        state.fetchLoading = true
        state.error = null
      })
      .addCase(fetchMyInterestsThunk.fulfilled, (state, action) => {
        state.fetchLoading = false
        state.registeredInterests = {}
        for (const item of action.payload) state.registeredInterests[item.offerId] = item.id
      })
      .addCase(fetchMyInterestsThunk.rejected, (state) => {
        state.fetchLoading = false
      })
      // ── registerInterest ─────────────────────────────────────────
      .addCase(registerInterestThunk.pending, (state, action) => {
        state.pendingOfferIds.push(action.meta.arg)
        state.error = null
      })
      .addCase(registerInterestThunk.fulfilled, (state, action) => {
        state.pendingOfferIds = state.pendingOfferIds.filter((id) => id !== action.payload.offerId)
        state.registeredInterests[action.payload.offerId] = action.payload.interestId
      })
      .addCase(registerInterestThunk.rejected, (state, action) => {
        state.pendingOfferIds = state.pendingOfferIds.filter((id) => id !== action.meta.arg)
        state.error = action.payload ?? 'Algo deu errado. Tente novamente.'
      })
      // ── removeInterest ───────────────────────────────────────────
      .addCase(removeInterestThunk.pending, (state, action) => {
        state.pendingOfferIds.push(action.meta.arg)
        state.error = null
      })
      .addCase(removeInterestThunk.fulfilled, (state, action) => {
        state.pendingOfferIds = state.pendingOfferIds.filter((id) => id !== action.payload)
        delete state.registeredInterests[action.payload]
      })
      .addCase(removeInterestThunk.rejected, (state, action) => {
        state.pendingOfferIds = state.pendingOfferIds.filter((id) => id !== action.meta.arg)
        state.error = action.payload ?? 'Algo deu errado. Tente novamente.'
      })
  }
})

const { select } = createBranchSelectors<InterestState>({
  paths: [['interest']],
  fallback: initialState
})

/** `true` enquanto `fetchMyInterestsThunk` está em andamento. */
export const selectFetchInterestLoading = select((state) => state.fetchLoading)
/** IDs das offers em processamento (registro ou remoção) — desabilita o botão do card individualmente. */
export const selectPendingOfferIds = select((state) => state.pendingOfferIds)
/** Mensagem de erro da última falha, ou `null`. */
export const selectInterestError = select((state) => state.error)
/** Mapa offerId → interestId das offers com interesse registrado pelo shopper. */
export const selectRegisteredInterests = select((state) => state.registeredInterests)

export default slice.reducer
