import { useSelector } from 'react-redux'
import type { RootState } from '@/store'

/** `useSelector` tipado com `RootState`. */
export const useAppSelector = useSelector.withTypes<RootState>()
