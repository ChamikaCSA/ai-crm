'use client'

import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Globe, Shield, Key } from 'lucide-react'
import { ChangePasswordDialog } from '@/components/dashboard/ChangePasswordDialog'
import { MfaSetupDialog } from '@/components/dashboard/MfaSetupDialog'
import { useState } from 'react'
import { toast } from 'sonner'

export default function SettingsPage() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  })

  if (!user) {
    redirect('/auth/login')
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/users/${user.id}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to update profile')
      }

      const data = await response.json()
      updateUser(data)
      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Profile Settings */}
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <User className="w-6 h-6 text-[var(--primary)]" />
            Profile Settings
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Manage your personal information and profile settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit} className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[var(--text-secondary)]">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[var(--text-secondary)]">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[var(--text-secondary)]">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]"
              />
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full md:w-auto"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Security */}
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-[var(--primary)]" />
            Account Security
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">
            Manage your account security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-medium">Two-Factor Authentication</h3>
                </div>
              <p className="text-sm text-[var(--text-tertiary)]">
                Add an extra layer of security to your account
              </p>
              </div>
              <MfaSetupDialog userId={user.id} />
            </div>
          </div>
          <div className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-[var(--primary)]" />
                  <h3 className="font-medium">Password</h3>
                </div>
              <p className="text-sm text-[var(--text-tertiary)]">
                Change your password
              </p>
              </div>
              <ChangePasswordDialog userId={user.id} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}