import { Route, Routes as ReactDOMRoutes } from 'react-router-dom'

import Home from '@/pages/Home'

/** Mapeamento central de caminho → página da aplicação. */
export function Routes() {
  return (
    <ReactDOMRoutes>
      <Route path="/" element={<Home />} />
    </ReactDOMRoutes>
  )
}
