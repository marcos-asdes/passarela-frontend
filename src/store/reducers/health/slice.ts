import { createSlice } from '@reduxjs/toolkit'

import { fetchHealth } from '@/store/reducers/health/thunk'
import type { HealthState } from '@/store/reducers/health/types'
import { createBranchSelectors } from '@/utils/redux/createBranchSelectors'

export const initialState: HealthState = {
  data: null,
  loading: false,
  error: null
}

/** Slice `health`: guarda `loading`/`data`/`error` do thunk `fetchHealth`, sem reducers síncronos próprios. */
const slice = createSlice({
  name: 'health',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHealth.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchHealth.fulfilled, (state, action) => {
        state.data = action.payload
        state.loading = false
      })
      .addCase(fetchHealth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload ?? 'Ocorreu um erro inesperado'
      })
  }
})

const { select } = createBranchSelectors<HealthState>({
  paths: [['health']],
  fallback: initialState
})

/** Último payload de `fetchHealth`, ou `null` antes da primeira resposta. */
export const selectHealthData = select((state) => state.data)
/** `true` enquanto `fetchHealth` está em andamento. */
export const selectHealthLoading = select((state) => state.loading)
/** Mensagem de erro da última falha de `fetchHealth`, ou `null`. */
export const selectHealthError = select((state) => state.error)

export default slice.reducer
