
import { createContext, useContext, useState } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = sessionStorage.getItem('user')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const [loading, setLoading] = useState(false)

  // Register a new USER account.
  const register = async (userData) => {
    const response = await api.post('/auth/register/', userData)
    return response.data
  }

  // Login for both ADMIN and USER.
  const login = async (credentials) => {
    setLoading(true)

    try {
      const response = await api.post('/auth/login/', credentials)

      const { access, refresh, user } = response.data

      sessionStorage.setItem('accessToken', access)
      sessionStorage.setItem('refreshToken', refresh)
      sessionStorage.setItem('user', JSON.stringify(user))

      setUser(user)

      return user
    } finally {
      setLoading(false)
    }
  }

  // Logout.
  const logout = () => {
    sessionStorage.removeItem('accessToken')
    sessionStorage.removeItem('refreshToken')
    sessionStorage.removeItem('user')

    setUser(null)
  }

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: Boolean(user),
    isAdmin: user?.role === 'ADMIN',
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
