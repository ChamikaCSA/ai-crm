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
import { Badge } from '@/components/ui/badge'
import { Plus, Calendar, Clock, CheckSquare, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface Task {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  leadName: string
  leadCompany: string
}

export default function TasksPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [error, setError] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockTasks: Task[] = [
        {
          id: '1',
          title: 'Follow up with John Doe',
          description: 'Discuss proposal details and next steps',
          status: 'todo',
          priority: 'high',
          dueDate: '2024-03-20',
          leadName: 'John Doe',
          leadCompany: 'Tech Corp',
        },
        // Add more mock tasks here
      ]
      setTasks(mockTasks)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
      setError(true)
      toast.error('Failed to fetch tasks')
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: Task['priority']) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    }
    return colors[priority]
  }

  const columns = {
    todo: tasks.filter((task) => task.status === 'todo'),
    in_progress: tasks.filter((task) => task.status === 'in_progress'),
    completed: tasks.filter((task) => task.status === 'completed'),
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
            <div className="grid grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="h-8 w-32" />
                  <div className="space-y-2">
                    {[1, 2].map((j) => (
                      <Skeleton key={j} className="h-32 w-full" />
                    ))}
                  </div>
                </div>
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
              <p>Failed to load tasks</p>
              <Button variant="outline" size="sm" onClick={fetchTasks} className="group">
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
                <CheckSquare className="w-6 h-6 text-[var(--primary)]" />
                Task Management
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Track and manage your sales tasks
              </CardDescription>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-6">
              {Object.entries(columns).map(([status, tasks]) => (
                <Card key={status} className="bg-[var(--card)]/50">
                  <CardHeader>
                    <CardTitle className="capitalize">
                      {status.replace('_', ' ')}
                    </CardTitle>
                    <CardDescription>
                      {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tasks.map((task) => (
                        <Card key={task.id} className="p-4 bg-[var(--card)]/50">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <h3 className="font-medium">{task.title}</h3>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {task.description}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center">
                                <Calendar className="mr-1 h-4 w-4" />
                                {task.dueDate}
                              </div>
                              <div className="flex items-center">
                                <Clock className="mr-1 h-4 w-4" />
                                Due soon
                              </div>
                            </div>
                            <div className="pt-2">
                              <p className="text-sm font-medium">{task.leadName}</p>
                              <p className="text-sm text-muted-foreground">
                                {task.leadCompany}
                              </p>
                            </div>
                            <div className="flex justify-end gap-2 pt-2">
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                              <Button size="sm">Complete</Button>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}