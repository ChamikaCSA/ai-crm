'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api-client'
import { User, UserRole } from '@/lib/types'
import { interactionService } from '@/lib/interaction-service'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  updateUser: (userData: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const refreshUser = useCallback(async () => {
    try {
      const user = await api.get<User>('/api/auth/me')
      setUser(user)
    } catch (error) {
      setUser(null)
      throw error
    }
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await refreshUser()
      } catch (error) {
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }
    checkAuth()
  }, [refreshUser])

  const updateUser = (userData: User) => {
    setUser(userData)
  }

  const login = async (email: string, password: string) => {
    try {
      const { user, access_token, refresh_token } = await api.post<{ user: User; access_token: string; refresh_token: string }>('/api/auth/login', { email, password })
      setUser(user)
      document.cookie = `token=${access_token}; path=/; max-age=900` // 15 minutes
      document.cookie = `refresh_token=${refresh_token}; path=/; max-age=604800` // 7 days

      // Track login interaction
      await interactionService.trackLogin(email)

      router.push('/dashboard')
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }

  const logout = async () => {
    try {
      // Track logout before clearing user state
      if (user) {
        await interactionService.trackLogout(user.email)
      }

      setUser(null)
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      await api.post('/api/auth/logout', {})
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout failed:', error)
      // Still clear local state and redirect even if the API call fails
      setUser(null)
      document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      document.cookie = 'refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      router.push('/auth/login')
    }
  }

  // Don't render children until initial auth check is complete
  if (isLoading) {
    return null
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshUser, updateUser }}>
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