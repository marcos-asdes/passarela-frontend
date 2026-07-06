import { encryptTransform } from 'redux-persist-transform-encrypt'

/** Transform do redux-persist que criptografa (AES) o estado persistido antes de gravar no localStorage. */
export const encryptor = encryptTransform({
  secretKey: import.meta.env.VITE_REDUX_PERSIST_ENCRYPTION_KEY,
  onError: (error: Error): void => {
    console.error(error)
  }
})
