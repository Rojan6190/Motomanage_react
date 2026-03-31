// src/api.js
import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
})

// ── Request interceptor ───────────────────────────────────────────────────────
// Attach the access token to every outgoing request automatically.
api.interceptors.request.use(
  (config) => {
    const access = localStorage.getItem('access')
    if (access) {
      config.headers.Authorization = `Bearer ${access}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ── Response interceptor ──────────────────────────────────────────────────────
// If a request comes back 401 (token expired), try to refresh once.
// If the refresh also fails, clear storage and redirect to /login.
let isRefreshing = false
let failedQueue  = []  // holds requests that came in while a refresh was in progress

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) reject(error)
    else resolve(token)
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh on 401, and only once per request (_retry flag)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        // Another refresh is already in flight — queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return api(originalRequest)
          })
          .catch(err => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const refresh = localStorage.getItem('refresh')
        const { data } = await axios.post('http://localhost:8000/api/token/refresh/', { refresh })

        // Store the new tokens
        localStorage.setItem('access',  data.access)
        localStorage.setItem('refresh', data.refresh)  // rotated refresh token

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${data.access}`
        processQueue(null, data.access)
        return api(originalRequest)

      } catch (refreshError) {
        // Refresh failed — session is dead, force logout
        processQueue(refreshError, null)
        localStorage.removeItem('access')
        localStorage.removeItem('refresh')
        localStorage.removeItem('user')
        window.location.href = '/login'
        return Promise.reject(refreshError)

      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default api