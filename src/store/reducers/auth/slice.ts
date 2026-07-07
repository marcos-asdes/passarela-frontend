import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import { fetchProfileThunk, loginThunk, registerThunk } from '@/store/reducers/auth/thunk'
import type { AuthState, AuthUser, LoginSessionState, ProfileSessionState } from '@/store/reducers/auth/types'
import { UserRole } from '@/store/reducers/auth/types'
import { createBranchSelectors } from '@/utils/redux/createBranchSelectors'

const initialLoginSession: LoginSessionState = { loading: false, error: null, accessToken: null, user: null }
const initialProfileSession: ProfileSessionState = { loading: false, error: null, name: null, email: null }

export const initialState: AuthState = {
  register: { loading: false, error: null, success: false },
  login: { [UserRole.Merchant]: { ...initialLoginSession }, [UserRole.Shopper]: { ...initialLoginSession } },
  profile: { [UserRole.Merchant]: { ...initialProfileSession }, [UserRole.Shopper]: { ...initialProfileSession } }
}

/**
 * Slice `auth`: trata `registerThunk`, `loginThunk` e `fetchProfileThunk` de forma independente.
 * `login`/`profile` são chaveados por papel — merchant e shopper autenticados ao mesmo tempo não
 * se sobrescrevem, cada dispatch só toca o papel do próprio payload/argumento do thunk.
 */
const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    registerReset(state) {
      state.register = initialState.register
    },
    logout(state, action: PayloadAction<UserRole>) {
      state.login[action.payload] = initialState.login[action.payload]
      state.profile[action.payload] = initialState.profile[action.payload]
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
      .addCase(loginThunk.pending, (state, action) => {
        const role = action.meta.arg.role
        state.login[role].loading = true
        state.login[role].error = null
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        const role = action.meta.arg.role
        state.login[role].loading = false
        state.login[role].accessToken = action.payload.accessToken
        state.login[role].user = action.payload.user
      })
      .addCase(loginThunk.rejected, (state, action) => {
        const role = action.meta.arg.role
        state.login[role].loading = false
        state.login[role].error = action.payload ?? 'Something went wrong. Please try again.'
      })
      .addCase(fetchProfileThunk.pending, (state, action) => {
        const role = action.meta.arg
        state.profile[role].loading = true
        state.profile[role].error = null
      })
      .addCase(fetchProfileThunk.fulfilled, (state, action) => {
        const role = action.meta.arg
        state.profile[role].loading = false
        state.profile[role].name = action.payload.name
        state.profile[role].email = action.payload.email
      })
      .addCase(fetchProfileThunk.rejected, (state, action) => {
        const role = action.meta.arg
        state.profile[role].loading = false
        state.profile[role].error = action.payload ?? 'Something went wrong. Please try again.'
      })
  }
})

const { select, selectBranch } = createBranchSelectors<AuthState>({
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

/** `true` enquanto `loginThunk` do papel está em andamento. */
export const selectLoginLoading =
  (role: UserRole) =>
  (state: RootState): boolean =>
    selectBranch(state).login[role].loading
/** Mensagem de erro da última falha de `loginThunk` do papel, ou `null`. */
export const selectLoginError =
  (role: UserRole) =>
  (state: RootState): string | null =>
    selectBranch(state).login[role].error
/** Usuário autenticado no papel, ou `null` antes do login. */
export const selectLoginUser =
  (role: UserRole) =>
  (state: RootState): AuthUser | null =>
    selectBranch(state).login[role].user
/** JWT da sessão ativa do papel, ou `null` antes do login — usado pelo interceptor de Authorization. */
export const selectLoginAccessToken =
  (role: UserRole) =>
  (state: RootState): string | null =>
    selectBranch(state).login[role].accessToken

/** `true` enquanto `fetchProfileThunk` do papel está em andamento. */
export const selectProfileLoading =
  (role: UserRole) =>
  (state: RootState): boolean =>
    selectBranch(state).profile[role].loading
/** Mensagem de erro da última falha de `fetchProfileThunk` do papel, ou `null`. */
export const selectProfileError =
  (role: UserRole) =>
  (state: RootState): string | null =>
    selectBranch(state).profile[role].error
/** Nome do usuário autenticado no papel, ou `null` antes de `fetchProfileThunk` resolver. */
export const selectProfileName =
  (role: UserRole) =>
  (state: RootState): string | null =>
    selectBranch(state).profile[role].name
/** E-mail do usuário autenticado no papel, ou `null` antes de `fetchProfileThunk` resolver. */
export const selectProfileEmail =
  (role: UserRole) =>
  (state: RootState): string | null =>
    selectBranch(state).profile[role].email

export default slice.reducer
