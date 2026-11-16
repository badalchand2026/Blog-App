
import axios from 'axios'

const baseURL = import.meta.env.VITE_API_BASE_URL

// Main API instance
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Separate instance for refreshing tokens.
// It does not use the main API interceptors.
const refreshClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Shared promise prevents multiple simultaneous refresh requests.
let refreshPromise = null

// Clear the stored authentication session.
const clearAuthSession = () => {
  sessionStorage.removeItem('accessToken')
  sessionStorage.removeItem('refreshToken')
  sessionStorage.removeItem('user')

  window.dispatchEvent(new Event('auth:logout'))
}

// Attach access token to every API request.
api.interceptors.request.use(
  (config) => {
    const accessToken = sessionStorage.getItem('accessToken')

    if (accessToken) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${accessToken}`
    }

    return config
  },
  (error) => Promise.reject(error)
)

// Handle expired access tokens.
api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config

    // Only handle 401 responses.
    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error)
    }

    // Do not retry the same request repeatedly.
    if (originalRequest._retry) {
      return Promise.reject(error)
    }

    // Do not refresh when login or refresh itself fails.
    const requestUrl = originalRequest.url ?? ''

    if (
      requestUrl.includes('/auth/login/') ||
      requestUrl.includes('/auth/refresh/')
    ) {
      return Promise.reject(error)
    }

    originalRequest._retry = true

    const refreshToken = sessionStorage.getItem('refreshToken')

    // No refresh token means the session cannot be renewed.
    if (!refreshToken) {
      clearAuthSession()
      return Promise.reject(error)
    }

    try {
      // Reuse an existing refresh request if one is already running.
      if (!refreshPromise) {
        refreshPromise = refreshClient
          .post('/auth/refresh/', {
            refresh: refreshToken,
          })
          .then((response) => {
            const { access, refresh } = response.data

            if (!access) {
              throw new Error('Refresh response did not contain an access token.')
            }

            // Save the new access token.
            sessionStorage.setItem('accessToken', access)

            // Save the rotated refresh token when the backend returns one.
            if (refresh) {
              sessionStorage.setItem('refreshToken', refresh)
            }

            return access
          })
          .finally(() => {
            refreshPromise = null
          })
      }

      const newAccessToken = await refreshPromise

      // Retry the original failed request.
      originalRequest.headers = originalRequest.headers ?? {}
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

      return api(originalRequest)
    } catch (refreshError) {
      // Refresh failed: the user must log in again.
      clearAuthSession()
      return Promise.reject(refreshError)
    }
  }
)

export default api
