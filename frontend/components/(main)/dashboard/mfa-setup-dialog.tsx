'use client'

import { useState } from 'react'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import Image from 'next/image'
import { useAuth } from '@/contexts/AuthContext'
import { interactionService } from '@/lib/interaction-service'

interface MfaSetupDialogProps {
  userId: string
}

export function MfaSetupDialog({ userId }: MfaSetupDialogProps) {
  const { user, refreshUser } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [token, setToken] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerateSecret = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ secret: string; qrCode: string }>('/api/auth/mfa')
      setQrCode(response.qrCode)
    } catch (error) {
      console.error('Failed to generate MFA secret:', error)
      toast.error('Failed to generate MFA secret')
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnableMfa = async () => {
    if (!token) {
      toast.error('Please enter the verification code')
      return
    }

    try {
      setIsLoading(true)
      await api.post('/api/auth/mfa', { token })

      // Track MFA enablement
      if (user) {
        await interactionService.trackMfaStatusChange(user.email, true)
      }

      toast.success('MFA enabled successfully')
      await refreshUser()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to enable MFA:', error)
      toast.error('Failed to enable MFA')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisableMfa = async () => {
    try {
      setIsLoading(true)
      await api.post('/api/auth/mfa', { action: 'disable' })

      // Track MFA disablement
      if (user) {
        await interactionService.trackMfaStatusChange(user.email, false)
      }

      toast.success('MFA disabled successfully')
      await refreshUser()
      setIsOpen(false)
    } catch (error) {
      console.error('Failed to disable MFA:', error)
      toast.error('Failed to disable MFA')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        {user?.isMfaEnabled ? 'Disable' : 'Enable'}
      </Button>
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={user?.isMfaEnabled ? 'Disable Two-Factor Authentication' : 'Set Up Two-Factor Authentication'}
      >
        <div className="space-y-4">
          <p className="text-sm text-[var(--text-tertiary)]">
            {user?.isMfaEnabled
              ? 'Are you sure you want to disable two-factor authentication? This will make your account less secure.'
              : 'Scan the QR code with your authenticator app and enter the verification code below.'}
          </p>
          {user?.isMfaEnabled ? (
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-tertiary)]">
                Disabling two-factor authentication will remove the extra layer of security from your account.
                You will only need your password to log in.
              </p>
              <Button
                variant="destructive"
                onClick={handleDisableMfa}
                disabled={isLoading}
              >
                {isLoading ? 'Disabling...' : 'Disable MFA'}
              </Button>
            </div>
          ) : !qrCode ? (
            <Button onClick={handleGenerateSecret} disabled={isLoading}>
              {isLoading ? 'Generating...' : 'Generate QR Code'}
            </Button>
          ) : (
            <>
              <div className="flex justify-center p-4 bg-white rounded-lg">
                <Image src={qrCode} alt="MFA QR Code" width={200} height={200} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="token">Verification Code</Label>
                <Input
                  id="token"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
              </div>
              <Button onClick={handleEnableMfa} disabled={isLoading}>
                {isLoading ? 'Enabling...' : 'Enable MFA'}
              </Button>
            </>
          )}
        </div>
      </Modal>
    </>
  )
}