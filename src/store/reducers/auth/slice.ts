import { createSlice } from '@reduxjs/toolkit'

import { fetchProfileThunk, loginThunk, registerThunk } from '@/store/reducers/auth/thunk'
import type { AuthState } from '@/store/reducers/auth/types'
import { createBranchSelectors } from '@/utils/redux/createBranchSelectors'

export const initialState: AuthState = {
  register: { loading: false, error: null, success: false },
  login: { loading: false, error: null, accessToken: null, user: null },
  profile: { loading: false, error: null, name: null, email: null }
}

/** Slice `auth`: trata `registerThunk`, `loginThunk` e `fetchProfileThunk` de forma independente, cada um com seu próprio loading/error. */
const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerReset(state) {
      state.register = initialState.register
    },
    logout(state) {
      state.login = initialState.login
      state.profile = initialState.profile
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerThunk.pending, (state) => {
        state.register.loading = true
        state.register.error = null
        state.register.success = false
      })
      .addCase(registerThunk.fulfilled, (state) => {
        state.register.loading = false
        state.register.success = true
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.register.loading = false
        state.register.error = action.payload ?? 'Something went wrong. Please try again.'
      })
      .addCase(loginThunk.pending, (state) => {
        state.login.loading = true
        state.login.error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.login.loading = false
        state.login.accessToken = action.payload.accessToken
        state.login.user = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.login.loading = false
        state.login.error = action.payload ?? 'Something went wrong. Please try again.'
      })
      .addCase(fetchProfileThunk.pending, (state) => {
        state.profile.loading = true
        state.profile.error = null
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        state.profile.loading = false
        state.profile.name = action.payload.name
        state.profile.email = action.payload.email
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        state.profile.loading = false
        state.profile.error = action.payload ?? 'Something went wrong. Please try again.'
      })
  }
})

const { select } = createBranchSelectors<AuthState>({
  paths: [['auth']],
  fallback: initialState
})

export const { registerReset, logout } = slice.actions

/** `true` enquanto `registerThunk` está em andamento. */
export const selectRegisterLoading = select((state) => state.register.loading)
/** Mensagem de erro da última falha de `registerThunk`, ou `null`. */
export const selectRegisterError = select((state) => state.register.error)
/** `true` quando a última chamada de `registerThunk` teve sucesso. */
export const selectRegisterSuccess = select((state) => state.register.success)
/** `true` enquanto `loginThunk` está em andamento. */
export const selectLoginLoading = select((state) => state.login.loading)
/** Mensagem de erro da última falha de `loginThunk`, ou `null`. */
export const selectLoginError = select((state) => state.login.error)
/** Usuário autenticado, ou `null` antes do login. */
export const selectLoginUser = select((state) => state.login.user)
/** JWT da sessão ativa, ou `null` antes do login — usado pelo interceptor de Authorization. */
export const selectLoginAccessToken = select((state) => state.login.accessToken)
/** `true` enquanto `fetchProfileThunk` está em andamento. */
export const selectProfileLoading = select((state) => state.profile.loading)
/** Mensagem de erro da última falha de `fetchProfileThunk`, ou `null` — trava novas tentativas automáticas. */
export const selectProfileError = select((state) => state.profile.error)
/** Nome do usuário autenticado, ou `null` antes de `fetchProfileThunk` resolver. */
export const selectProfileName = select((state) => state.profile.name)
/** E-mail do usuário autenticado, ou `null` antes de `fetchProfileThunk` resolver. */
export const selectProfileEmail = select((state) => state.profile.email)

export default slice.reducer
