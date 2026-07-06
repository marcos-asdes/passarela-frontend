import { combineReducers, configureStore } from '@reduxjs/toolkit'
import { FLUSH, PAUSE, PERSIST, persistReducer, persistStore, PURGE, REGISTER, REHYDRATE } from 'redux-persist'
import type { PersistConfig } from 'redux-persist'
/** Build ESM (não `lib`, CJS) — evita interop quebrado do Vite com o `module.exports` do build CJS. */
import storage from 'redux-persist/es/storage'

import authReducer from '@/store/reducers/auth'
import type { AuthState } from '@/store/reducers/auth/types'
import { encryptor } from '@/utils/redux/persistEncryption'

/**
 * Só `login` é persistido (o accessToken/user sobrevive a um refresh) — `register` é estado
 * transiente de formulário, não faz sentido sobreviver ao fechamento da aba.
 */
const authPersistConfig: PersistConfig<AuthState> = {
  key: 'passarela_auth',
  storage,
  whitelist: ['login'],
  transforms: import.meta.env.DEV ? [] : [encryptor]
}

/** Root reducer da aplicação — um reducer por bounded state em `store/reducers/`. */
const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer)
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

/** Shape completo do estado global, inferido do próprio store. */
export type RootState = ReturnType<typeof store.getState>
/** Tipo do `dispatch` do store, usado por `useAppDispatch`. */
export type AppDispatch = typeof store.dispatch

export default store
