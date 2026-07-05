import { API_HEALTH_ROUTES } from '@/services/apiRoutes/health'
import { axiosApi } from '@/services/api/axiosApi'
import type { HealthApiInfo } from '@/store/reducers/health/types'
import { createThunk } from '@/utils/redux/createThunk'

/** Busca o status da API (`GET /` do backend). */
export const fetchHealth = createThunk<HealthApiInfo>('health/fetchHealth', async () => {
  const response = await axiosApi.get<HealthApiInfo>(API_HEALTH_ROUTES.get.info)
  return response.data
})
