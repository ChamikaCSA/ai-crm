'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Users,
  Shield,
  Lock,
  AlertCircle,
  Plus,
  ChevronRight,
  Calendar,
  UserPlus,
  UserCog,
  Key,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  MoreHorizontal,
  Edit,
  Trash2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { UserDialog } from './user-dialog'
import { UserRole } from '@/lib/types'

interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isMfaEnabled: boolean
  isEmailVerified: boolean
  isActive: boolean
  interactionHistory: any[]
  preferences: any[]
  createdAt: string
  updatedAt: string
}

interface UserMetric {
  name: string
  value: number
  trend: number
  change: number
}

interface Role {
  name: string
  description: string
  permissions: string[]
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [metrics, setMetrics] = useState<UserMetric[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAddUserOpen, setIsAddUserOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingUserId, setEditingUserId] = useState<string | null>(null)
  const [newUser, setNewUser] = useState({
    email: '',
    firstName: '',
    lastName: '',
    role: UserRole.SALES_REP,
    isMfaEnabled: false,
  })

  const fetchUsersData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user metrics
      const metricsResponse = await fetch('/api/admin/users/metrics')
      if (!metricsResponse.ok) throw new Error('Failed to fetch user metrics')
      const metricsData = await metricsResponse.json()
      setMetrics(metricsData.metrics || [])

      // Fetch users
      const usersResponse = await fetch('/api/admin/users')
      if (!usersResponse.ok) throw new Error('Failed to fetch users')
      const usersData = await usersResponse.json()
      setUsers(Array.isArray(usersData) ? usersData : [])
    } catch (err) {
      console.error('Error fetching users data:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsersData()
  }, [])

  const getRoleColor = (role: UserRole) => {
    const colors = {
      [UserRole.ADMIN]: 'bg-purple-100 text-purple-800',
      [UserRole.SALES_REP]: 'bg-blue-100 text-blue-800',
      [UserRole.SALES_MANAGER]: 'bg-indigo-100 text-indigo-800',
      [UserRole.MARKETING_SPECIALIST]: 'bg-green-100 text-green-800',
      [UserRole.DATA_ANALYST]: 'bg-yellow-100 text-yellow-800',
      [UserRole.CUSTOMER]: 'bg-gray-100 text-gray-800',
    }
    return colors[role]
  }

  const handleAddUser = async () => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      })

      if (!response.ok) throw new Error('Failed to add user')

      toast.success('User added successfully')
      setIsAddUserOpen(false)
      setNewUser({
        email: '',
        firstName: '',
        lastName: '',
        role: UserRole.SALES_REP,
        isMfaEnabled: false,
      })
      fetchUsersData() // Refresh the user list
    } catch (error) {
      console.error('Error adding user:', error)
      toast.error('Failed to add user')
    }
  }

  const handleEditUser = (userId: string) => {
    setEditingUserId(userId)
    setIsEditDialogOpen(true)
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete user')

      toast.success('User deleted successfully')
      fetchUsersData()
    } catch (error) {
      console.error('Error deleting user:', error)
      toast.error('Failed to delete user')
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesRole = roleFilter === 'all' || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  if (loading) {
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
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="bg-[var(--card)]/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-8 w-24 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="p-6">
            <div className="h-32 flex flex-col items-center justify-center text-[var(--text-tertiary)] space-y-2">
              <AlertCircle className="w-8 h-8 text-[var(--warning)]" />
              <p>{error}</p>
              <Button variant="outline" size="sm" onClick={() => {
                fetchUsersData()
              }} className="group">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6 text-[var(--primary)]" />
                User Management
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Manage users and permissions
              </CardDescription>
            </div>
            <UserDialog
              open={isAddUserOpen}
              onOpenChange={setIsAddUserOpen}
              onUserUpdated={fetchUsersData}
              trigger={
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              }
            />
          </CardHeader>

          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                  <SelectItem value={UserRole.SALES_REP}>Sales Rep</SelectItem>
                  <SelectItem value={UserRole.SALES_MANAGER}>Sales Manager</SelectItem>
                  <SelectItem value={UserRole.MARKETING_SPECIALIST}>Marketing Specialist</SelectItem>
                  <SelectItem value={UserRole.DATA_ANALYST}>Data Analyst</SelectItem>
                  <SelectItem value={UserRole.CUSTOMER}>Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>MFA</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={getRoleColor(user.role)}>
                        {user.role.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={user.isMfaEnabled ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}
                      >
                        {user.isMfaEnabled ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user._id)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user._id)}
                          className="hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <UserDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onUserUpdated={fetchUsersData}
        userId={editingUserId}
      />
    </motion.div>
  )
}