import { createSelector } from '@reduxjs/toolkit'

import type { RootState } from '@/store'
import type { BranchPath, BranchSelectors } from '@/utils/redux/createBranchSelectors/types'

/** Navega `state` pelas chaves de `path`; retorna `undefined` se qualquer passo não existir. */
function getByPath<T>(state: unknown, path: BranchPath): T | undefined {
  let current: unknown = state
  for (const key of path) {
    if (current == null || typeof current !== 'object' || !(key in current)) return undefined
    current = (current as Record<string, unknown>)[key]
  }
  return current as T | undefined
}

/**
 * Cria seletores pra uma branch do estado, tentando cada caminho de `paths` em ordem até achar
 * um valor definido. Sem nenhum caminho encontrado, cai no `fallback`.
 */
export function createBranchSelectors<Branch>(opts: {
  paths: BranchPath[]
  fallback: Branch
}): BranchSelectors<Branch> {
  const selectBranch = (state: RootState): Branch => {
    for (const path of opts.paths) {
      const value = getByPath<Branch>(state, path)
      if (value !== undefined) return value
    }
    return opts.fallback
  }

  const select = <R>(projector: (branch: Branch) => R): ((state: RootState) => R) =>
    createSelector(selectBranch, projector)

  return { selectBranch, select }
}
