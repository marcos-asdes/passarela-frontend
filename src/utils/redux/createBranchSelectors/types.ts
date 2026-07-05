import type { RootState } from '@/store'

/** Caminho imutável até uma propriedade aninhada no estado do Redux. Ex.: `['health']`. */
export type BranchPath = readonly string[]

/** Par de seletores produzido por `createBranchSelectors`. */
export interface BranchSelectors<Branch> {
  /** Resolve a branch tentando cada caminho de `paths`, em ordem, até encontrar um valor definido. */
  selectBranch: (state: RootState) => Branch
  /** Cria um seletor memoizado (`createSelector`) a partir da branch já resolvida. */
  select: <R>(projector: (branch: Branch) => R) => (state: RootState) => R
}
