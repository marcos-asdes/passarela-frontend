import { useAppSelector } from '@/hooks/useAppSelector'
import { selectHealthData, selectHealthError } from '@/store/reducers/health/slice'

/** Lê o resultado de `fetchHealth` do store. */
export function useHome() {
  const health = useAppSelector(selectHealthData)
  const error = useAppSelector(selectHealthError)

  return { health, error }
}
