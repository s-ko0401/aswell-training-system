import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  withCredentials: false,
})

api.interceptors.request.use((config) => {
  let token = localStorage.getItem('auth_token')
  if (!token) {
    const persisted = localStorage.getItem('auth_state')
    if (persisted) {
      try {
        token = (JSON.parse(persisted) as { token?: string | null }).token ?? null
      } catch {
        token = null
      }
    }
  }

  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export { api }
