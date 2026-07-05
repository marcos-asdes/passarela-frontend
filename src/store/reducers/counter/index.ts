import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

/** Estado do contador de exemplo. */
interface CounterState {
  value: number
}

const initialState: CounterState = {
  value: 0
}

/** Slice de exemplo, sem API. */
const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    incremented: (state) => {
      state.value += 1
    },
    decremented: (state) => {
      state.value -= 1
    },
    addedByAmount: (state, action: PayloadAction<number>) => {
      state.value += action.payload
    }
  }
})

export const { incremented, decremented, addedByAmount } = counterSlice.actions
export default counterSlice.reducer
