import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes as ReactDOMRoutes } from 'react-router-dom'

import { LoadingFallback } from '@/components/LoadingFallback'
import Landing from '@/pages/Landing'
import { RequireRole } from '@/routes/RequireRole'
import { UserRole } from '@/store/reducers/auth/types'

const MerchantLogin = lazy(() => import('@/pages/MerchantLogin'))
const MerchantRegister = lazy(() => import('@/pages/MerchantRegister'))
const MerchantDashboard = lazy(() => import('@/pages/MerchantDashboard'))
const ShopperLogin = lazy(() => import('@/pages/ShopperLogin'))
const ShopperRegister = lazy(() => import('@/pages/ShopperRegister'))
const ShopperFeed = lazy(() => import('@/pages/ShopperFeed'))

/**
 * Mapeamento central de caminho → página da aplicação. Paths em pt-BR — público-alvo é BR.
 * Só `Landing` (primeira tela) é import estático — as outras são lazy, cada uma em chunk próprio,
 * pra manter o carregamento inicial leve. `/lojista/painel` e `/cliente/ofertas` são protegidas
 * por papel via `RequireRole`.
 */
export function Routes(): ReactNode {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReactDOMRoutes>
        <Route path="/" element={<Landing />} />
        <Route path="/lojista/entrar" element={<MerchantLogin />} />
        <Route path="/lojista/cadastro" element={<MerchantRegister />} />
        <Route
          path="/lojista/painel"
          element={
            <RequireRole role={UserRole.Merchant}>
              <MerchantDashboard />
            </RequireRole>
          }
        />
        <Route path="/cliente/entrar" element={<ShopperLogin />} />
        <Route path="/cliente/cadastro" element={<ShopperRegister />} />
        <Route
          path="/cliente/ofertas"
          element={
            <RequireRole role={UserRole.Shopper}>
              <ShopperFeed />
            </RequireRole>
          }
        />
      </ReactDOMRoutes>
    </Suspense>
  )
}
