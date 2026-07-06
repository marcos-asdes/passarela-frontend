import { lazy, Suspense, type ReactNode } from 'react'
import { Route, Routes as ReactDOMRoutes } from 'react-router-dom'

import { LoadingFallback } from '@/components/LoadingFallback'
import Landing from '@/pages/Landing'

const SellerLogin = lazy(() => import('@/pages/SellerLogin'))
const SellerRegister = lazy(() => import('@/pages/SellerRegister'))
const CustomerLogin = lazy(() => import('@/pages/CustomerLogin'))
const CustomerRegister = lazy(() => import('@/pages/CustomerRegister'))

/**
 * Mapeamento central de caminho → página da aplicação. Paths em pt-BR — público-alvo é BR.
 * Só `Landing` (primeira tela) é import estático — as outras 4 são lazy, cada uma em chunk próprio,
 * pra manter o carregamento inicial leve.
 */
export function Routes(): ReactNode {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ReactDOMRoutes>
        <Route path="/" element={<Landing />} />
        <Route path="/lojista/entrar" element={<SellerLogin />} />
        <Route path="/lojista/cadastro" element={<SellerRegister />} />
        <Route path="/cliente/entrar" element={<CustomerLogin />} />
        <Route path="/cliente/cadastro" element={<CustomerRegister />} />
      </ReactDOMRoutes>
    </Suspense>
  )
}
