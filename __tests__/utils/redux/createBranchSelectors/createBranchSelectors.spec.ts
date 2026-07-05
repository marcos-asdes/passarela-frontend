/**
 * Testes unitários para createBranchSelectors
 *
 * Cenários testados:
 * - `selectBranch` resolve pelo primeiro caminho de `paths` que existir no state
 * - `selectBranch` cai no `fallback` quando nenhum caminho existe
 * - `select` cria um seletor projetado a partir da branch resolvida
 */

import { describe, expect, it } from 'vitest'

import type { RootState } from '@/store'
import { createBranchSelectors } from '@/utils/redux/createBranchSelectors'

describe('createBranchSelectors', () => {
  it('resolve a branch pelo primeiro caminho encontrado', () => {
    const { selectBranch } = createBranchSelectors<{ value: number }>({
      paths: [['a', 'b'], ['c']],
      fallback: { value: 0 }
    })
    const state = { a: { b: { value: 5 } } } as unknown as RootState

    expect(selectBranch(state)).toEqual({ value: 5 })
  })

  it('cai no fallback quando nenhum caminho existe', () => {
    const { selectBranch } = createBranchSelectors<{ value: number }>({
      paths: [['missing']],
      fallback: { value: -1 }
    })

    expect(selectBranch({} as unknown as RootState)).toEqual({ value: -1 })
  })

  it('select cria um seletor projetado a partir da branch', () => {
    const { select } = createBranchSelectors<{ value: number }>({
      paths: [['health']],
      fallback: { value: 0 }
    })
    const selectValue = select((branch) => branch.value)
    const state = { health: { value: 42 } } as unknown as RootState

    expect(selectValue(state)).toBe(42)
  })
})
