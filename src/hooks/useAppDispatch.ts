import { useDispatch } from 'react-redux'
import type { AppDispatch } from '@/store'

/** `useDispatch` tipado com `AppDispatch`. */
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
