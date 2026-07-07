/**
 * Testes unitários para LoadingFallback
 *
 * Cenários testados:
 * - renderiza o spinner de carregamento
 */

import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { LoadingFallback } from '@/components/LoadingFallback'

describe('LoadingFallback', () => {
  it('renderiza o spinner de carregamento', () => {
    const { container } = render(<LoadingFallback />)

    expect(container.querySelector('.ant-spin')).toBeInTheDocument()
  })
})
