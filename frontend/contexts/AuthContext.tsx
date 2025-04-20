'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const refreshToken = async () => {
    try {
      const data = await api.get<{ user: User; token: string }>('/api/auth/refresh')
      setUser(data.user)
      document.cookie = `token=${data.token}; path=/; max-age=86400`
    } catch (error) {
      setUser(null)
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {})
    } finally {
      setUser(null)
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/auth/login')
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      try {
        const data = await api.get<{ user: User }>('/api/auth/me')
        setUser(data.user)
      } catch (error) {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()

    // Set up token refresh interval
    const interval = setInterval(refreshToken, 30 * 60 * 1000) // Refresh every 30 minutes

    return () => clearInterval(interval)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}