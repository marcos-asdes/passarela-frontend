import { combineReducers, configureStore } from '@reduxjs/toolkit'

import counterReducer from '@/store/reducers/counter'
import healthReducer from '@/store/reducers/health'

/** Root reducer da aplicação — um reducer por bounded state em `store/reducers/`. */
const rootReducer = combineReducers({
  counter: counterReducer,
  health: healthReducer
})

/** Store Redux único da aplicação. */
const store = configureStore({
  reducer: rootReducer
})

/** Shape completo do estado global, inferido do próprio store. */
export type RootState = ReturnType<typeof store.getState>
/** Tipo do `dispatch` do store, usado por `useAppDispatch`. */
export type AppDispatch = typeof store.dispatch

export default store
