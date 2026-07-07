import { combineReducers, configureStore } from '@reduxjs/toolkit'
import type { PersistConfig } from 'redux-persist'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
/** Build ESM (não `lib`, CJS) — evita interop quebrado do Vite com o `module.exports` do build CJS. */
import getStoredState from 'redux-persist/es/getStoredState'
import storage from 'redux-persist/es/storage'

import { setAccessToken } from '@/services/api/authToken'
import authReducer from '@/store/reducers/auth'
import { selectLoginAccessToken } from '@/store/reducers/auth/slice'
import type { AuthState } from '@/store/reducers/auth/types'
import { UserRole } from '@/store/reducers/auth/types'
import interestReducer from '@/store/reducers/interest'
import offersReducer from '@/store/reducers/offers'
import { createEncryptor } from '@/utils/redux/persistEncryption'

/**
 * Só `login` é persistido (o accessToken/user sobrevive a um refresh) — `register` é estado
 * transiente de formulário, não faz sentido sobreviver ao fechamento da aba. `login` já é
 * chaveado por papel (merchant/shopper), então as duas sessões persistem juntas nesse único slot.
 */
const authPersistConfig: PersistConfig<AuthState> = {
  key: 'passarela_auth',
  storage,
  whitelist: ['login'],
  transforms: import.meta.env.DEV ? [] : [createEncryptor<AuthState>()]
}

/** Root reducer da aplicação — um reducer por bounded state em `store/reducers/`. `offers`/`interest`
 * não persistem: são dados de servidor (feed/dashboard), não estado de formulário. */
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  offers: offersReducer,
  interest: interestReducer
})

/** Store Redux único da aplicação. */
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      /** Ações do redux-persist carregam valores não serializáveis — o serializableCheck padrão do RTK acusaria falso positivo nelas. */
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER]
      }
    })
})

/** Controla o ciclo de rehydration/persist do store — consumido pelo `PersistGate` em `App.tsx`. */
export const persistor = persistStore(store)

/**
 * Mantém `services/api/authToken` sincronizado com `auth.login[role].accessToken` — é o que o
 * interceptor de `axiosApi` lê pra montar o header `Authorization`. Fora do módulo do axios de
 * propósito: evita um ciclo de import (o `store` acaba importando os thunks, que importam o `axiosApi`).
 */
function syncAccessTokensFromState(): void {
  const state = store.getState()
  setAccessToken(UserRole.Merchant, selectLoginAccessToken(UserRole.Merchant)(state))
  setAccessToken(UserRole.Shopper, selectLoginAccessToken(UserRole.Shopper)(state))
}

store.subscribe(syncAccessTokensFromState)
syncAccessTokensFromState()

/**
 * redux-persist só reidrata uma vez, no boot da aba — sem isso, logar/deslogar numa aba não
 * aparece nas outras até um F5. Ouve o evento nativo `storage` (só dispara nas OUTRAS abas, nunca
 * na que escreveu) e reidrata a branch `auth` manualmente via `getStoredState` (já reaplica os
 * mesmos transforms de des/criptografia que `persistReducer` usaria), despachando um `REHYDRATE` —
 * que `persistReducer` sabe mesclar a qualquer momento, não só no boot.
 */
const AUTH_STORAGE_KEY = `persist:${authPersistConfig.key}`

window.addEventListener('storage', (event) => {
  if (event.key !== AUTH_STORAGE_KEY) return

  void getStoredState(authPersistConfig).then((restoredState) => {
    if (restoredState) store.dispatch({ type: REHYDRATE, key: authPersistConfig.key, payload: restoredState })
  })
})

/** Shape completo do estado global, inferido do próprio store. */
export type RootState = ReturnType<typeof store.getState>
/** Tipo do `dispatch` do store, usado por `useAppDispatch`. */
export type AppDispatch = typeof store.dispatch

export default store
