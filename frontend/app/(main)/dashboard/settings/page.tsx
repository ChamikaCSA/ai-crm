'use client'

import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { User, Globe, Shield, Key, Save, Settings2, Bell, Lock, Settings } from 'lucide-react'
import { ChangePasswordDialog } from '@/components/(main)/dashboard/ChangePasswordDialog'
import { MfaSetupDialog } from '@/components/(main)/dashboard/MfaSetupDialog'
import { useState } from 'react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { interactionService } from '@/lib/interaction-service'

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

      // Track profile update
      await interactionService.trackProfileUpdate(formData)

      toast.success('Profile updated successfully')
    } catch (error) {
      console.error('Profile update error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to update profile')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-8 w-48" />
              </div>
              <Skeleton className="h-4 w-64" />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {[1, 2].map((index) => (
              <div key={index} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]/50">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-5 w-5" />
                      <Skeleton className="h-5 w-48" />
                    </div>
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-9 w-32" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      {/* Profile Settings */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Settings className="w-6 h-6 text-[var(--primary)]" />
                Profile Settings
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Manage your personal information and profile settings
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-[var(--text-secondary)]">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)] transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-[var(--text-secondary)]">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)] transition-colors"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--text-secondary)]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)] transition-colors"
                />
              </div>
              <div className="flex justify-start">
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-auto group"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>

      {/* Account Security */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Lock className="w-6 h-6 text-[var(--primary)]" />
                Account Security
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Manage your account security settings
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors group bg-[var(--card)]/50 hover:bg-[var(--card)]/80">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-[var(--primary)]" />
                    <h3 className="font-medium group-hover:text-[var(--primary)] transition-colors">Two-Factor Authentication</h3>
                  </div>
                  <p className="text-sm text-[var(--text-tertiary)]">
                    Add an extra layer of security to your account
                  </p>
                </div>
                <MfaSetupDialog userId={user.id} />
              </div>
            </div>
            <div className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors group bg-[var(--card)]/50 hover:bg-[var(--card)]/80">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[var(--primary)]" />
                    <h3 className="font-medium group-hover:text-[var(--primary)] transition-colors">Password</h3>
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
      </motion.div>
    </motion.div>
  )
}