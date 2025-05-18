'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Users, AlertCircle, MoreHorizontal, Eye, Edit, Plus, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { api } from '@/lib/api-client'
import { LeadSource, LeadStatus } from '@/lib/api-types'
import { LeadDialog } from './lead-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { Progress } from "@/components/ui/progress"

interface Lead {
  _id: string
  firstName: string
  lastName: string
  company: string
  email: string
  phone: string
  status: LeadStatus
  leadScore: number
  source: LeadSource
  updatedAt: string
}

export default function LeadsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [leads, setLeads] = useState<Lead[]>([])
  const [error, setError] = useState(false)
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  useEffect(() => {
    fetchLeads()
  }, [])

  const fetchLeads = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<{ data: Lead[] }>('/api/sales-rep/leads')
      setLeads(Array.isArray(response.data) ? response.data : [])
      setError(false)
    } catch (error) {
      console.error('Failed to fetch leads:', error)
      setError(true)
      toast.error('Failed to fetch leads')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
      [LeadStatus.CONTACTED]: 'bg-yellow-100 text-yellow-800',
      [LeadStatus.QUALIFIED]: 'bg-green-100 text-green-800',
      [LeadStatus.PROPOSAL]: 'bg-purple-100 text-purple-800',
      [LeadStatus.NEGOTIATION]: 'bg-orange-100 text-orange-800',
      [LeadStatus.CLOSED_WON]: 'bg-green-100 text-green-800',
      [LeadStatus.CLOSED_LOST]: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    try {
      await api.put(`/api/sales-rep/leads/${leadId}/status`, { status: newStatus })
      toast.success('Lead status updated')
      fetchLeads() // Refresh the leads list
    } catch (error) {
      console.error('Failed to update lead status:', error)
      toast.error('Failed to update lead status')
    }
  }

  const handleViewLead = (leadId: string) => {
    router.push(`/dashboard/leads/${leadId}`)
  }

  const handleEditLead = (leadId: string) => {
    setSelectedLeadId(leadId)
    setIsEditDialogOpen(true)
  }

  const handleDeleteLead = async (leadId: string) => {
    try {
      await api.delete(`/api/sales-rep/leads?id=${leadId}`)
      toast.success('Lead deleted successfully')
      fetchLeads()
    } catch (error) {
      console.error('Failed to delete lead:', error)
      toast.error('Failed to delete lead')
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
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 flex-1" />
                <Skeleton className="h-10 w-[180px]" />
              </div>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
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
              <p>Failed to load leads</p>
              <Button variant="outline" size="sm" onClick={fetchLeads} className="group">
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
                Lead Management
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Manage and track your leads through the sales pipeline
              </CardDescription>
            </div>
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search leads..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  {Object.values(LeadStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead._id}>
                    <TableCell className="font-medium">
                      {lead.firstName} {lead.lastName}
                    </TableCell>
                    <TableCell>{lead.company}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>{lead.email}</div>
                        <div className="text-sm text-muted-foreground">
                          {lead.phone}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Badge className={`${getStatusColor(lead.status)} cursor-pointer`}>
                            {lead.status.charAt(0).toUpperCase() + lead.status.slice(1).replace('_', ' ')}
                          </Badge>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                          {Object.values(LeadStatus).map((status) => (
                            <DropdownMenuItem
                              key={status}
                              onClick={() => handleStatusChange(lead._id, status)}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <Progress value={lead.leadScore} className="w-16" />
                        <span>{lead.leadScore}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{lead.source.charAt(0).toUpperCase() + lead.source.slice(1).replace('_', ' ')}</TableCell>
                    <TableCell>{new Date(lead.updatedAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewLead(lead._id)}
                          className="hover:bg-secondary"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditLead(lead._id)}
                          className="hover:bg-secondary"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteLead(lead._id)}
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

      <LeadDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onLeadUpdated={fetchLeads}
      />

      <LeadDialog
        leadId={selectedLeadId}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onLeadUpdated={fetchLeads}
      />
    </motion.div>
  )
}