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
  ArrowDownRight
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'sales_rep' | 'marketing_specialist' | 'it_admin'
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string
  mfaEnabled: boolean
  permissions: string[]
}

interface UserMetric {
  name: string
  value: number
  trend: number
  change: number
}

export default function UsersPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [metrics, setMetrics] = useState<UserMetric[]>([])

  useEffect(() => {
    fetchUsersData()
  }, [])

  const fetchUsersData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockUsers: User[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'admin',
          status: 'active',
          lastLogin: '2024-03-15 14:30',
          mfaEnabled: true,
          permissions: ['manage_users', 'view_analytics', 'manage_roles']
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@example.com',
          role: 'sales_rep',
          status: 'active',
          lastLogin: '2024-03-15 13:45',
          mfaEnabled: false,
          permissions: ['view_leads', 'manage_tasks']
        }
      ]

      const mockMetrics: UserMetric[] = [
        {
          name: 'Total Users',
          value: 45,
          trend: 12.5,
          change: 5.2
        },
        {
          name: 'Active Users',
          value: 38,
          trend: 8.2,
          change: 3.1
        },
        {
          name: 'MFA Enabled',
          value: 32,
          trend: 15.5,
          change: 7.2
        }
      ]

      setUsers(mockUsers)
      setMetrics(mockMetrics)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch users data:', error)
      setError(true)
      toast.error('Failed to fetch users data')
    } finally {
      setIsLoading(false)
    }
  }

  const getRoleColor = (role: User['role']) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-800',
      sales_rep: 'bg-blue-100 text-blue-800',
      marketing_specialist: 'bg-green-100 text-green-800',
      it_admin: 'bg-red-100 text-red-800',
    }
    return colors[role]
  }

  const getStatusColor = (status: User['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
    }
    return colors[status]
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
              <p>Failed to load users data</p>
              <Button variant="outline" size="sm" onClick={fetchUsersData} className="group">
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
                Manage users, roles, and permissions
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <UserCog className="mr-2 h-4 w-4" />
                Manage Roles
              </Button>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => (
                <Card key={metric.name} className="bg-[var(--card)]/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {metric.name}
                    </CardTitle>
                    <Users className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <div className="flex items-center pt-1">
                      {metric.trend > 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500" />
                      )}
                      <span className={`text-sm ml-1 ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {metric.trend > 0 ? '+' : ''}{metric.trend}%
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>User List</CardTitle>
                  <CardDescription>
                    Manage user accounts and permissions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div key={user.id} className="p-4 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                              <Users className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{user.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Badge className={getRoleColor(user.role)}>
                              {user.role}
                            </Badge>
                            <Badge className={getStatusColor(user.status)}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">Last Login</p>
                            <p className="text-sm text-muted-foreground">
                              {user.lastLogin}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">Security</p>
                            <div className="flex items-center gap-2 mt-1">
                              {user.mfaEnabled ? (
                                <Badge className="bg-green-100 text-green-800">
                                  <Lock className="w-3 h-3 mr-1" />
                                  MFA Enabled
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Key className="w-3 h-3 mr-1" />
                                  MFA Disabled
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end mt-4">
                          <Button variant="ghost" size="sm">
                            Manage Permissions
                            <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Security Overview</CardTitle>
                  <CardDescription>
                    System security status and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { name: 'MFA Adoption', value: '71%', status: 'good' },
                      { name: 'Failed Logins', value: '12', status: 'warning' },
                      { name: 'Security Score', value: '85/100', status: 'good' }
                    ].map((item) => (
                      <div key={item.name} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{item.name}</p>
                          <Badge className={item.status === 'good' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {item.value}
                          </Badge>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.status === 'good' ? 'bg-green-500' : 'bg-yellow-500'}`}
                            style={{ width: item.name === 'Security Score' ? '85%' : '71%' }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest user actions and system events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { user: 'John Doe', action: 'Updated user permissions', time: '2 minutes ago' },
                    { user: 'Jane Smith', action: 'Enabled MFA', time: '15 minutes ago' },
                    { user: 'System', action: 'Security scan completed', time: '1 hour ago' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Activity className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium leading-none">
                            {activity.user}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.action}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}