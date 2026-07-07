/**
 * Testes unitários para o transform de criptografia do redux-persist
 *
 * Cenários testados:
 * - chama encryptTransform com a secretKey do ambiente
 * - onError loga o erro no console
 */

import { beforeEach, describe, expect, it, vi } from 'vitest'

const encryptTransformMock = vi.fn((config: unknown) => config)

vi.mock('redux-persist-transform-encrypt', () => ({
  encryptTransform: encryptTransformMock
}))

describe('encryptor', () => {
  beforeEach(() => {
    vi.resetModules()
    encryptTransformMock.mockClear()
  })

  it('chama encryptTransform com a secretKey do ambiente', async () => {
    const { createEncryptor } = await import('@/utils/redux/persistEncryption')
    const encryptor = createEncryptor()

    expect(encryptTransformMock).toHaveBeenCalledWith(
      expect.objectContaining({ secretKey: import.meta.env.VITE_REDUX_PERSIST_ENCRYPTION_KEY })
    )
    expect(encryptor).toBeDefined()
  })

  it('onError loga o erro no console', async () => {
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const { createEncryptor } = await import('@/utils/redux/persistEncryption')
    const encryptor = createEncryptor()
    const error = new Error('falha ao descriptografar')

    ;(encryptor as unknown as { onError: (error: Error) => void }).onError(error)

    expect(consoleErrorSpy).toHaveBeenCalledWith(error)
    consoleErrorSpy.mockRestore()
  })
})
