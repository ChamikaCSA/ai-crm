'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { User, UserRole } from '@/lib/types'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await api.get<User>('/api/auth/me')
        setUser(user)
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [])

  const refreshUser = async () => {
    try {
      const user = await api.get<User>('/api/auth/me')
      setUser(user)
    } catch (error) {
      setUser(null)
    }
  }

  const login = async (email: string, password: string) => {
    const { user, access_token, refresh_token } = await api.post<{ user: User; access_token: string; refresh_token: string }>('/api/auth/login', { email, password })
    setUser(user)
    document.cookie = `token=${access_token}; path=/; max-age=900` // 15 minutes
    document.cookie = `refresh_token=${refresh_token}; path=/; max-age=604800` // 7 days
    router.push('/dashboard')
  }

  const logout = async () => {
    await api.post('/api/auth/logout', {})
    setUser(null)
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/auth/login')
  }

  // Don't render children until initial auth check is complete
  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser }}>
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