'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from 'sonner'
import { Copy, RefreshCw } from 'lucide-react'
import { UserRole } from '@/lib/types'

interface UserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserUpdated: () => void
  userId?: string | null
  trigger?: React.ReactNode
}

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isMfaEnabled: boolean
  isEmailVerified: boolean
  isActive: boolean
  createdAt: string
  updatedAt: string
}

function generatePassword(length: number = 12): string {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const special = '!@#$%^&*'

  // Ensure at least one character from each required set
  let password = [
    uppercase[Math.floor(Math.random() * uppercase.length)],
    lowercase[Math.floor(Math.random() * lowercase.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)]
  ].join('')

  // Fill the rest of the password with random characters from all sets
  const allChars = uppercase + lowercase + numbers + special
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)]
  }

  // Shuffle the password to make it more random
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

export function UserDialog({ open, onOpenChange, onUserUpdated, userId, trigger }: UserDialogProps) {
  const [user, setUser] = useState<Partial<User>>({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.SALES_REP,
    isMfaEnabled: false,
    isActive: true,
  })
  const [password, setPassword] = useState(generatePassword())
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (userId && open) {
      fetchUser()
    }
  }, [userId, open])

  const fetchUser = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/admin/users/${userId}`)
      if (!response.ok) throw new Error('Failed to fetch user')
      const data = await response.json()
      setUser(data)
    } catch (error) {
      console.error('Error fetching user:', error)
      toast.error('Failed to fetch user details')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const url = userId ? `/api/admin/users/${userId}` : '/api/admin/users'
      const method = userId ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...user,
          ...(userId ? {} : { password }), // Only include password for new users
        }),
      })

      if (!response.ok) throw new Error('Failed to save user')

      toast.success(`User ${userId ? 'updated' : 'created'} successfully`)
      onUserUpdated()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving user:', error)
      toast.error(`Failed to ${userId ? 'update' : 'create'} user`)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password)
    toast.success('Password copied to clipboard')
  }

  const handleRegeneratePassword = () => {
    setPassword(generatePassword())
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{userId ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogDescription>
            {userId ? 'Update user details below.' : 'Create a new user account.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
              required
            />
          </div>
          {!userId && (
            <div className="space-y-2">
              <Label htmlFor="password">Initial Password</Label>
              <div className="flex gap-2">
                <Input
                  id="password"
                  type="text"
                  value={password}
                  readOnly
                  className="font-mono"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPassword}
                  title="Copy password"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleRegeneratePassword}
                  title="Generate new password"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This password will be shown only once. Make sure to copy it.
              </p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                value={user.firstName}
                onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                value={user.lastName}
                onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select
              value={user.role}
              onValueChange={(value) => setUser({ ...user, role: value as UserRole })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.SALES_REP}>Sales Rep</SelectItem>
                <SelectItem value={UserRole.SALES_MANAGER}>Sales Manager</SelectItem>
                <SelectItem value={UserRole.MARKETING_SPECIALIST}>Marketing Specialist</SelectItem>
                <SelectItem value={UserRole.DATA_ANALYST}>Data Analyst</SelectItem>
                <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Switch
                id="mfa"
                checked={user.isMfaEnabled}
                onCheckedChange={(checked) => setUser({ ...user, isMfaEnabled: checked })}
              />
              <Label htmlFor="mfa">Enable MFA</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={user.isActive}
                onCheckedChange={(checked) => setUser({ ...user, isActive: checked })}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : userId ? 'Update User' : 'Create User'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}