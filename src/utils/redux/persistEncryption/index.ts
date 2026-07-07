import { encryptTransform } from 'redux-persist-transform-encrypt'

/**
 * Transform do redux-persist que criptografa (AES) o estado persistido antes de gravar no localStorage.
 * Fábrica (não um valor pronto): `encryptTransform` já valida `secretKey` na hora da chamada, então
 * construir isso a nível de módulo rodaria sempre que `@/store` fosse importado — inclusive em teste,
 * onde a chave nunca está definida — mesmo o `DEV` check em `store/index.ts` nunca escolhendo esse transform.
 */
export function createEncryptor(): ReturnType<typeof encryptTransform> {
  return encryptTransform({
    secretKey: import.meta.env.VITE_REDUX_PERSIST_ENCRYPTION_KEY,
    onError: (error: Error): void => {
      console.error(error)
    }
  })
}
