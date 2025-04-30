'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Lock, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from '../../../components/auth/auth-layout';
import { AuthCard } from '../../../components/auth/auth-card';
import { AuthInput } from '../../../components/auth/auth-input';
import { AuthAlert } from '../../../components/auth/auth-alert';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const message = searchParams.get('message');
    if (message && !message.includes('verify your email')) {
      setSuccess(message);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const response = await api.post<{ user: any; access_token: string; refresh_token: string; requiresMfa: boolean }>('/api/auth/login', { email, password });

      if (response.requiresMfa) {
        router.push(`/auth/mfa-verify?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`);
      } else {
        await login(email, password);
        const from = searchParams.get('from');
        router.push(from || '/dashboard');
      }
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Welcome back"
        description="Sign in to your account to continue"
        icon={Sparkles}
      >
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <AuthAlert message={error} variant="destructive" />}
          {success && <AuthAlert message={success} />}

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

          <div className="flex items-center justify-between">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Forgot password?
            </Link>
            <Link
              href="/auth/register"
              className="text-sm text-[var(--primary)] hover:underline"
            >
              Create account
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
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </AuthCard>
    </AuthLayout>
  );
}