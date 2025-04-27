'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { api } from '@/lib/api-client'
import { ApiError } from '@/lib/api-client'
import { Button } from '@/components/ui/button'
import { Loader2, Mail, Lock, User, Sparkles } from 'lucide-react'
import { AuthLayout } from '../../../components/auth/AuthLayout'
import { AuthCard } from '../../../components/auth/AuthCard'
import { AuthInput } from '../../../components/auth/AuthInput'
import { AuthAlert } from '../../../components/auth/AuthAlert'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const confirmPassword = formData.get('confirmPassword') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const data = await api.post<{ access_token: string; user: any; error?: string }>('/api/auth/register', {
        email,
        password,
        firstName,
        lastName,
      })

      if (data.error) {
        throw new Error(data.error)
      }

      router.push('/auth/login?message=Please check your email to verify your account before logging in')
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message)
      } else if (error instanceof Error) {
        setError(error.message)
      } else {
        setError('An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Create your account"
        description="Join us and start managing your customer relationships"
        icon={Sparkles}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <AuthAlert message={error} variant="destructive" />}

          <div className="grid grid-cols-2 gap-4">
            <AuthInput
              id="firstName"
              name="firstName"
              type="text"
              label="First Name"
              icon={User}
              placeholder="e.g. John"
              required
            />
            <AuthInput
              id="lastName"
              name="lastName"
              type="text"
              label="Last Name"
              icon={User}
              placeholder="e.g. Smith"
              required
            />
          </div>

          <AuthInput
            id="email"
            name="email"
            type="email"
            label="Email"
            icon={Mail}
            placeholder="e.g. john@example.com"
            required
          />

          <AuthInput
            id="password"
            name="password"
            label="Password"
            icon={Lock}
            showPasswordToggle
            placeholder="••••••••"
            required
          />

          <AuthInput
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            icon={Lock}
            showPasswordToggle
            placeholder="••••••••"
            required
          />

          <div className="flex items-center justify-between">
            <Link
              href="/auth/login"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Already have an account?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  )
}