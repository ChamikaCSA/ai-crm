'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { AuthLayout } from '../../../components/auth/auth-layout';
import { AuthCard } from '../../../components/auth/auth-card';
import { AuthInput } from '../../../components/auth/auth-input';
import { AuthAlert } from '../../../components/auth/auth-alert';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const token = searchParams.get('token');
    if (!token) {
      setError('No reset token provided');
      return;
    }

    setStatus('loading');

    try {
      await api.post('/api/auth/reset-password', {
        token,
        newPassword: password,
      });
      setStatus('success');
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error: any) {
      setStatus('idle');
      setError(error.message || 'Failed to reset password');
    }
  };

  return (
    <AuthLayout>
      <AuthCard
        title="Reset your password"
        description="Enter your new password below"
        icon={Lock}
      >
        {error && <AuthAlert message={error} variant="destructive" />}

        {status === 'success' ? (
          <AuthAlert message="Password reset successful! Redirecting to login..." />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthInput
              id="password"
              name="password"
              label="New Password"
              icon={Lock}
              showPasswordToggle
              placeholder="••••••••"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <AuthInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm New Password"
              icon={Lock}
              showPasswordToggle
              placeholder="••••••••"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting password...
                </>
              ) : (
                'Reset password'
              )}
            </Button>
          </form>
        )}
      </AuthCard>
    </AuthLayout>
  );
}