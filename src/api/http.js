import axios from 'axios'
import { API_BASE_URL } from './config.js'
import { getStoredToken, clearSession } from '../auth/session.js'

export const http = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
})

http.interceptors.request.use((config) => {
  const token = getStoredToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession()
      if (typeof window !== 'undefined') {
        window.location.assign('/login')
      }
    }
    const message =
      error.response?.data?.error?.message ?? error.message ?? 'Error inesperado de red';
    return Promise.reject(new Error(message))
  },
)
