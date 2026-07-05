import axios from 'axios'

/** Instância única do axios, usada pelos thunks. */
export const axiosApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL
})
