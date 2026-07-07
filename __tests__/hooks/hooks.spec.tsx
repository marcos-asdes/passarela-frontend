/**
 * Testes unitários para useAppDispatch/useAppSelector
 *
 * Cenários testados:
 * - useAppDispatch devolve o dispatch do store
 * - useAppSelector lê o state do store
 */

import { configureStore } from '@reduxjs/toolkit'
import { renderHook } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'

import { useAppDispatch } from '@/hooks/useAppDispatch'
import { useAppSelector } from '@/hooks/useAppSelector'
import authReducer, { selectLoginUser } from '@/store/reducers/auth/slice'
import { UserRole } from '@/store/reducers/auth/types'

function buildStore() {
  return configureStore({ reducer: { auth: authReducer } })
}

function Wrapper({ children }: Readonly<{ children: ReactNode }>): ReactNode {
  return <Provider store={buildStore()}>{children}</Provider>
}

describe('useAppDispatch', () => {
  it('devolve o dispatch do store', () => {
    const { result } = renderHook(() => useAppDispatch(), { wrapper: Wrapper })

    expect(typeof result.current).toBe('function')
  })
})

describe('useAppSelector', () => {
  it('lê o state do store', () => {
    const { result } = renderHook(() => useAppSelector(selectLoginUser(UserRole.Shopper)), { wrapper: Wrapper })

    expect(result.current).toBeNull()
  })
})
