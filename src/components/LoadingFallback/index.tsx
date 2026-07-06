import type { ReactNode } from 'react'
import { Spin } from 'antd'

import * as S from '@/components/LoadingFallback/styles'

/** Fallback de tela cheia — usado enquanto o redux-persist reidrata o state ou uma rota lazy carrega o chunk. */
export function LoadingFallback(): ReactNode {
  return (
    <S.Page>
      <Spin size="large" />
    </S.Page>
  )
}
