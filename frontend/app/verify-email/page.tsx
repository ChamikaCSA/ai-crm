'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setError('No verification token provided');
      return;
    }

    const verifyEmail = async () => {
      try {
        await api.post('/api/auth/verify-email', { token });
        setStatus('success');
        // Automatically redirect to home page after a short delay
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (error: any) {
        setStatus('error');
        setError(error.message || 'Failed to verify email');
      }
    };

    verifyEmail();
  }, [searchParams, router]);

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
                {status === 'success' ? (
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="w-6 h-6 text-green-500" />
                  </div>
                ) : status === 'error' ? (
                  <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                ) : (
                  <div className="w-12 h-12 bg-[var(--primary)]/10 rounded-xl flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[var(--primary)] animate-spin" />
                  </div>
                )}
              </div>
              <CardTitle className="text-2xl text-center text-[var(--text-primary)]">
                {status === 'success' ? 'Email Verified!' : status === 'error' ? 'Verification Failed' : 'Verifying Email'}
              </CardTitle>
              <CardDescription className="text-center text-[var(--text-tertiary)]">
                {status === 'success'
                  ? 'Your email has been verified successfully. Redirecting you to the dashboard...'
                  : status === 'error'
                  ? error
                  : 'Please wait while we verify your email address'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {status === 'error' && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => router.push('/auth/login')}
                >
                  Back to login
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}