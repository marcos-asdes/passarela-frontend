import { createAsyncThunk, type AsyncThunk } from '@reduxjs/toolkit'

/**
 * Factory de thunks com tratamento de erro padronizado: qualquer rejeição vira
 * `rejectWithValue(message)`, nunca uma exception não tratada no reducer.
 */
export function createThunk<R, A = void>(
  type: string,
  fn: (arg: A) => Promise<R>
): AsyncThunk<R, A, { rejectValue: string }> {
  return createAsyncThunk<R, A, { rejectValue: string }>(type, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg)
    } catch (error) {
      const message = error instanceof Error && error.message ? error.message : 'Ocorreu um erro inesperado'
      return rejectWithValue(message)
    }
  })
}
