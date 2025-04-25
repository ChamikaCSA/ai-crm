'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'
import { ApiError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Shield, ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'

export default function MfaVerifyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login } = useAuth()
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState<string | null>(null)
  const [password, setPassword] = useState<string | null>(null)

  useEffect(() => {
    // Get email and password from URL params
    const emailParam = searchParams.get('email')
    const passwordParam = searchParams.get('password')

    if (!emailParam || !passwordParam) {
      router.push('/auth/login')
      return
    }

    setEmail(emailParam)
    setPassword(passwordParam)
  }, [searchParams, router])

  const handleVerify = async () => {
    if (!token) {
      setError('Please enter the verification code')
      return
    }

    if (token.length !== 6) {
      setError('Please enter a valid 6-digit code')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // First verify the MFA token
      await api.post('/api/auth/mfa/verify', { token })

      // Then complete the login process
      if (email && password) {
        await login(email, password)
        const from = searchParams.get('from')
        router.push(from || '/dashboard')
      }
    } catch (error) {
      console.error('Failed to verify MFA:', error)
      if (error instanceof ApiError) {
        setError(error.message)
      } else {
        setError('Failed to verify MFA code. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  if (!email || !password) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/20 via-transparent to-[var(--accent)]/20" />
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="relative flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="card shadow-xl hover:shadow-2xl transition-all">
            <CardHeader className="space-y-1">
              <div className="flex items-center justify-center mb-4">
                <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-[var(--primary)]" />
                </div>
              </div>
              <CardTitle className="text-2xl text-center text-[var(--text-primary)]">Two-Factor Authentication</CardTitle>
              <CardDescription className="text-center text-[var(--text-tertiary)]">
                Please enter the verification code from your authenticator app.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  </motion.div>
                )}
                <div className="space-y-2">
                  <label htmlFor="token" className="text-sm font-medium text-[var(--text-primary)]">
                    Verification Code
                  </label>
                  <Input
                    id="token"
                    value={token}
                    onChange={(e) => {
                      setToken(e.target.value.replace(/[^0-9]/g, ''))
                      setError(null)
                    }}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    pattern="[0-9]*"
                  />
                </div>
                <Button
                  onClick={handleVerify}
                  className="w-full btn-primary shadow-lg hover:shadow-xl transition-all group"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-center text-[var(--text-tertiary)]">
                Don't have access to your authenticator app?{' '}
                <Button
                  variant="link"
                  className="text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors font-medium p-0 h-auto"
                  onClick={() => router.push('/auth/login')}
                >
                  Go back to login
                </Button>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}