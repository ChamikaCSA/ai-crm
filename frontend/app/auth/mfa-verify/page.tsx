'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api-client'
import { ApiError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Loader2, Shield } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { AuthCard } from '../../../components/auth/AuthCard'
import { AuthInput } from '../../../components/auth/AuthInput'
import { AuthAlert } from '../../../components/auth/AuthAlert'

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

      await api.post('/api/auth/mfa/verify', { token })

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
    <AuthLayout>
      <AuthCard
        title="Two-Factor Authentication"
        description="Please enter the verification code from your authenticator app."
        icon={Shield}
      >
        <div className="space-y-4">
          {error && <AuthAlert message={error} variant="destructive" />}

          <AuthInput
            id="token"
            label="Verification Code"
            icon={Shield}
            placeholder="Enter 6-digit code"
            maxLength={6}
            autoComplete="one-time-code"
            inputMode="numeric"
            pattern="[0-9]*"
            value={token}
            onChange={(e) => {
              setToken(e.target.value.replace(/[^0-9]/g, ''))
              setError(null)
            }}
          />

          <Button
            onClick={handleVerify}
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verifying...
              </>
            ) : (
              'Verify'
            )}
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  )
}