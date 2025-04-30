'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '../../../components/auth/auth-layout';
import { AuthCard } from '../../../components/auth/auth-card';
import { AuthInput } from '../../../components/auth/auth-input';
import { AuthAlert } from '../../../components/auth/auth-alert';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setStatus('loading');

    try {
      await api.post('/api/auth/request-password-reset', { email });
      setStatus('success');
    } catch (error: any) {
      setStatus('idle');
      setError(error.message || 'Failed to request password reset');
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title={status === 'success' ? 'Check your email' : 'Forgot your password?'}
        description={
          status === 'success'
            ? 'We have sent you a password reset link. Please check your email.'
            : 'Enter your email address and we will send you a link to reset your password.'
        }
        icon={status === 'success' ? CheckCircle2 : Mail}
      >
        {error && <AuthAlert message={error} variant="destructive" />}

        {status !== 'success' && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              id="email"
              name="email"
              type="email"
              label="Email"
              icon={Mail}
              placeholder="e.g. john@example.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <div className="flex items-center justify-between">
              <Link
                href="/auth/login"
                className="text-sm text-[var(--primary)] hover:underline flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to login
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending reset link...
                </>
              ) : (
                'Send reset link'
              )}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}