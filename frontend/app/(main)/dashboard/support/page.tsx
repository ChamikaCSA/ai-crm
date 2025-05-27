'use client'

import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2, Ticket, Clock, CheckCircle2, AlertCircle, Paperclip, User as UserIcon, Bot, Headphones, Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { SupportTicketStatus, SupportTicketPriority, SupportTicketCategory, SupportTicket as BaseSupportTicket } from '@/lib/api-types'
import { Modal } from "@/components/ui/modal"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { interactionService } from '@/lib/interaction-service'

interface SupportTicketMessage {
  _id: string
  userId: string
  content: string
  createdAt: string
  attachments?: Array<{
    name: string
    url: string
  }>
}

interface SupportTicket extends BaseSupportTicket {
  replies: SupportTicketMessage[]
}

function CreateSupportTicketForm({ onTicketCreated }: { onTicketCreated?: () => void }) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<SupportTicketPriority>(SupportTicketPriority.MEDIUM)
  const [category, setCategory] = useState<SupportTicketCategory>(SupportTicketCategory.GENERAL)
  const [attachments, setAttachments] = useState<File[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in both subject and description.')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('subject', subject)
      formData.append('description', description)
      formData.append('priority', priority)
      formData.append('category', category)
      attachments.forEach((file) => {
        formData.append('attachments', file)
      })

      const response = await api.post<SupportTicket>('/api/customer/support-ticket', formData)

      // Track support ticket creation
      await interactionService.trackSupportTicket(
        response._id,
        'created',
        { subject, priority, category }
      )

      toast.success('Support ticket created successfully!')
      setSubject('')
      setDescription('')
      setAttachments([])
      onTicketCreated?.()
    } catch (error) {
      console.error('Failed to create support ticket:', error)
      toast.error('Failed to create support ticket. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject" className="text-[var(--text-secondary)]">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Briefly describe your issue"
            maxLength={100}
            required
            disabled={isLoading}
            className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[var(--text-secondary)]">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as SupportTicketPriority)}>
              <SelectTrigger className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SupportTicketPriority.LOW}>Low</SelectItem>
                <SelectItem value={SupportTicketPriority.MEDIUM}>Medium</SelectItem>
                <SelectItem value={SupportTicketPriority.HIGH}>High</SelectItem>
                <SelectItem value={SupportTicketPriority.URGENT}>Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-[var(--text-secondary)]">Category</Label>
            <Select value={category} onValueChange={(value) => setCategory(value as SupportTicketCategory)}>
              <SelectTrigger className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={SupportTicketCategory.GENERAL}>General</SelectItem>
                <SelectItem value={SupportTicketCategory.TECHNICAL}>Technical</SelectItem>
                <SelectItem value={SupportTicketCategory.BILLING}>Billing</SelectItem>
                <SelectItem value={SupportTicketCategory.FEATURE}>Feature Request</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-[var(--text-secondary)]">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the problem you are facing"
            rows={5}
            maxLength={1000}
            required
            disabled={isLoading}
            className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]"
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label className="flex items-center gap-2 cursor-pointer hover:text-[var(--primary)] transition-colors">
              <Paperclip className="w-4 h-4" />
              Attach Files
              <Input
                type="file"
                multiple
                onChange={handleFileChange}
                disabled={isLoading}
                className="hidden"
              />
            </Label>
          </div>
          {attachments.length > 0 && (
            <div className="mt-2 p-2 bg-[var(--accent)]/5 rounded-lg border border-[var(--border)]">
              <div className="flex flex-wrap gap-2">
                {attachments.map((file) => (
                  <div
                    key={`${file.name}-${file.size}-${file.lastModified}`}
                    className="flex items-center gap-2 bg-[var(--card)] px-2 py-1 rounded-md text-sm"
                  >
                    <span className="text-[var(--text-secondary)]">{file.name}</span>
                    <button
                      type="button"
                      onClick={() => setAttachments(prev => prev.filter((f) => f.name !== file.name || f.size !== file.size || f.lastModified !== file.lastModified))}
                      className="text-[var(--text-tertiary)] hover:text-[var(--destructive)] transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full group">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            <>Submit Ticket</>
          )}
        </Button>
      </form>
    </div>
  )
}

function TicketDetails({ ticket, onClose, onTicketUpdated }: { ticket: SupportTicket; onClose: () => void; onTicketUpdated: () => void }) {
  const [reply, setReply] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [attachments, setAttachments] = useState<File[]>([])
  const [currentTicket, setCurrentTicket] = useState<SupportTicket>({
    ...ticket,
    replies: ticket.replies || []
  })
  const [isClosing, setIsClosing] = useState(false)

  const downloadAttachment = async (filename: string, originalName: string) => {
    try {
      const response = await fetch(`/api/customer/support-ticket/attachment/${filename}`, {
        method: 'GET',
      })

      if (!response.ok) {
        throw new Error('Failed to download attachment')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = originalName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Failed to download attachment:', error)
      toast.error('Failed to download attachment')
    }
  }

  const fetchTicketDetails = async () => {
    try {
      const response = await api.get<SupportTicket>(`/api/customer/support-ticket/${ticket._id}`)
      setCurrentTicket({
        ...response,
        replies: response.replies || []
      })
    } catch (error) {
      console.error('Failed to fetch ticket details:', error)
      toast.error('Failed to refresh ticket details.')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files))
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reply.trim()) {
      toast.error('Please enter a reply message.')
      return
    }

    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('message', reply)
      attachments.forEach((file) => {
        formData.append('attachments', file)
      })

      await api.post(`/api/customer/support-ticket/${ticket._id}/reply`, formData)

      // Track support ticket update
      await interactionService.trackSupportTicket(
        ticket._id,
        'updated',
        { subject: ticket.subject, message: reply }
      )

      toast.success('Reply sent successfully!')
      setReply('')
      setAttachments([])
      // Refresh ticket details
      await fetchTicketDetails()
    } catch (error) {
      console.error('Failed to send reply:', error)
      toast.error('Failed to send reply. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCloseTicket = async () => {
    if (currentTicket.status === SupportTicketStatus.CLOSED) {
      toast.error('This ticket is already closed.')
      return
    }

    setIsClosing(true)
    try {
      await api.post(`/api/customer/support-ticket/${ticket._id}/close`, {})

      // Track support ticket closure
      await interactionService.trackSupportTicket(
        ticket._id,
        'closed',
        { subject: ticket.subject, status: SupportTicketStatus.CLOSED }
      )

      toast.success('Ticket closed successfully!')
      await fetchTicketDetails()
      onTicketUpdated()
      onClose()
    } catch (error) {
      console.error('Failed to close ticket:', error)
      toast.error('Failed to close ticket. Please try again.')
    } finally {
      setIsClosing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">{currentTicket.subject}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge
                variant={currentTicket.status === SupportTicketStatus.CLOSED ? 'success' : 'warning'}
                className="text-xs"
              >
                {currentTicket.status === SupportTicketStatus.CLOSED ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {currentTicket.status.replace('_', ' ')}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentTicket.priority}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {currentTicket.category}
              </Badge>
            </div>
          </div>
          {currentTicket.status !== SupportTicketStatus.CLOSED && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleCloseTicket}
              disabled={isClosing}
              className="group"
            >
              {isClosing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Closing...</>
              ) : (
                <>Close Ticket</>
              )}
            </Button>
          )}
        </div>
        <div className="space-y-4">
          <div className="p-4 rounded-lg bg-[var(--accent)] text-[var(--accent-foreground)]">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <UserIcon className="w-4 h-4" />
                <span className="font-medium">You</span>
              </div>
              <time className="text-xs opacity-75">
                {new Date(currentTicket.createdAt).toLocaleString()}
              </time>
            </div>
            <p className="mt-2">{currentTicket.description}</p>
            {currentTicket.attachments && currentTicket.attachments.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {currentTicket.attachments.map((attachment) => (
                  <button
                    key={`${attachment.name}-${attachment.url}`}
                    onClick={() => downloadAttachment(attachment.url.split('/').pop() || '', attachment.name)}
                    className="flex items-center gap-2 text-xs bg-[var(--card)]/50 px-2 py-1 rounded-md hover:bg-[var(--card)]/80 transition-colors"
                  >
                    <Paperclip className="w-3 h-3" />
                    {attachment.name}
                  </button>
                ))}
              </div>
            )}
          </div>
          {currentTicket.replies?.map((reply) => (
            <div
              key={reply._id}
              className={`p-4 rounded-lg ${
                reply.userId === currentTicket.userId
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-[var(--accent)] text-[var(--accent-foreground)]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {reply.userId === currentTicket.userId ? (
                    <UserIcon className="w-4 h-4" />
                  ) : (
                    <Bot className="w-4 h-4" />
                  )}
                  <span className="font-medium">
                    {reply.userId === currentTicket.userId ? 'You' : 'Support Team'}
                  </span>
                </div>
                <time className="text-xs opacity-75">
                  {new Date(reply.createdAt).toLocaleString()}
                </time>
              </div>
              <p className="mt-2">{reply.content}</p>
              {reply.attachments && reply.attachments.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {reply.attachments.map((attachment) => (
                    <button
                      key={`${attachment.name}-${attachment.url}`}
                      onClick={() => downloadAttachment(attachment.url.split('/').pop() || '', attachment.name)}
                      className="flex items-center gap-2 text-xs bg-[var(--card)]/50 px-2 py-1 rounded-md hover:bg-[var(--card)]/80 transition-colors"
                    >
                      <Paperclip className="w-3 h-3" />
                      {attachment.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {currentTicket.status !== SupportTicketStatus.CLOSED && (
        <form onSubmit={handleReply} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reply" className="text-[var(--text-secondary)]">Reply</Label>
            <Textarea
              id="reply"
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Type your reply..."
              rows={3}
              disabled={isLoading}
              className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="flex items-center gap-2 cursor-pointer hover:text-[var(--primary)] transition-colors">
                <Paperclip className="w-4 h-4" />
                Attach Files
                <Input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  disabled={isLoading}
                  className="hidden"
                />
              </Label>
            </div>
            {attachments.length > 0 && (
              <div className="mt-2 p-2 bg-[var(--accent)]/5 rounded-lg border border-[var(--border)]">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((file) => (
                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}`}
                      className="flex items-center gap-2 bg-[var(--card)] px-2 py-1 rounded-md text-sm"
                    >
                      <span className="text-[var(--text-secondary)]">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => setAttachments(prev => prev.filter((f) => f.name !== file.name || f.size !== file.size || f.lastModified !== file.lastModified))}
                        className="text-[var(--text-tertiary)] hover:text-[var(--destructive)] transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full group">
            {isLoading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <>Send Reply</>
            )}
          </Button>
        </form>
      )}
    </div>
  )
}

function SupportTicketList({ refreshKey, onTicketSelect, onTicketsUpdate }: {
  refreshKey?: number;
  onTicketSelect: (ticket: SupportTicket | null) => void;
  onTicketsUpdate: (tickets: SupportTicket[]) => void;
}) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<SupportTicketStatus | 'ALL'>('ALL')
  const [priorityFilter, setPriorityFilter] = useState<SupportTicketPriority | 'ALL'>('ALL')
  const [categoryFilter, setCategoryFilter] = useState<SupportTicketCategory | 'ALL'>('ALL')
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [isCreatingTicket, setIsCreatingTicket] = useState(false)

  const fetchTickets = async () => {
    try {
      const response = await api.get<SupportTicket[]>('/api/customer/support-ticket')
      const ticketsData = Array.isArray(response) ? response : []
      setTickets(ticketsData)
      onTicketsUpdate(ticketsData)
    } catch (error) {
      console.error('Failed to fetch support tickets:', error)
      toast.error('Failed to fetch support tickets')
      setTickets([])
      onTicketsUpdate([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [refreshKey])

  const handleTicketCreated = () => {
    setIsCreatingTicket(false)
    fetchTickets()
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || ticket.status === statusFilter
    const matchesPriority = priorityFilter === 'ALL' || ticket.priority === priorityFilter
    const matchesCategory = categoryFilter === 'ALL' || ticket.category === categoryFilter
    return matchesSearch && matchesStatus && matchesPriority && matchesCategory
  })

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-8 w-32" />
            </CardTitle>
            <CardDescription>
              <Skeleton className="h-4 w-48" />
            </CardDescription>
          </div>
          <Skeleton className="h-10 w-[120px]" />
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-[180px]" />
                <Skeleton className="h-10 w-[180px]" />
              </div>
            </div>

            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]/50">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-5 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Skeleton className="h-3 w-3" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Headphones className="w-6 h-6 text-[var(--primary)]" />
            Support Center
          </CardTitle>
          <CardDescription className="text-[var(--text-secondary)]">Get help and manage your support tickets</CardDescription>
        </div>
        <Button onClick={() => setIsCreatingTicket(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Ticket
        </Button>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]"
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as SupportTicketStatus | 'ALL')}>
                <SelectTrigger className="w-[180px] bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value={SupportTicketStatus.OPEN}>Open</SelectItem>
                  <SelectItem value={SupportTicketStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={SupportTicketStatus.CLOSED}>Closed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={(value) => setPriorityFilter(value as SupportTicketPriority | 'ALL')}>
                <SelectTrigger className="w-[180px] bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]">
                  <SelectValue placeholder="Filter by priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Priority</SelectItem>
                  <SelectItem value={SupportTicketPriority.LOW}>Low</SelectItem>
                  <SelectItem value={SupportTicketPriority.MEDIUM}>Medium</SelectItem>
                  <SelectItem value={SupportTicketPriority.HIGH}>High</SelectItem>
                  <SelectItem value={SupportTicketPriority.URGENT}>Urgent</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(value) => setCategoryFilter(value as SupportTicketCategory | 'ALL')}>
                <SelectTrigger className="w-[180px] bg-[var(--card)]/50 border-[var(--border)] focus:border-[var(--primary)]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Categories</SelectItem>
                  <SelectItem value={SupportTicketCategory.GENERAL}>General</SelectItem>
                  <SelectItem value={SupportTicketCategory.TECHNICAL}>Technical</SelectItem>
                  <SelectItem value={SupportTicketCategory.BILLING}>Billing</SelectItem>
                  <SelectItem value={SupportTicketCategory.FEATURE}>Feature Request</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredTickets.length === 0 ? (
            <div className="text-center py-8">
              <Ticket className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-tertiary)]">
                {searchQuery || statusFilter !== 'ALL' || priorityFilter !== 'ALL' || categoryFilter !== 'ALL'
                  ? 'No tickets match your search criteria'
                  : 'You have no support tickets'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredTickets.map((ticket, index) => (
                  <motion.div
                    key={ticket._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50 hover:bg-[var(--card)]/80 group cursor-pointer"
                    onClick={() => {
                      setSelectedTicket(ticket)
                      onTicketSelect(ticket)
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                          <Ticket className="w-5 h-5 text-[var(--primary)]" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                            {ticket.subject}
                          </h3>
                          <p className="text-sm text-[var(--text-tertiary)] line-clamp-2">
                            {ticket.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={ticket.status === SupportTicketStatus.CLOSED ? 'success' : 'warning'}
                            className="text-xs"
                          >
                            {ticket.status === SupportTicketStatus.CLOSED ? (
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                            ) : (
                              <AlertCircle className="w-3 h-3 mr-1" />
                            )}
                            {ticket.status.replace('_', ' ')}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {ticket.category}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-tertiary)]">
                          <Clock className="w-3 h-3" />
                          <time>{new Date(ticket.createdAt).toLocaleDateString()}</time>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </CardContent>

      <Modal
        isOpen={isCreatingTicket}
        onClose={() => setIsCreatingTicket(false)}
        title="Create Support Ticket"
      >
        <CreateSupportTicketForm onTicketCreated={handleTicketCreated} />
      </Modal>
    </Card>
  )
}

export default function SupportPage() {
  const { user } = useAuth()

  if (!user) {
    redirect('/auth/login')
  }

  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null)
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const handleTicketUpdated = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <SupportTicketList
            refreshKey={refreshKey}
            onTicketSelect={setSelectedTicket}
            onTicketsUpdate={(tickets) => {
              setTickets(tickets)
              setIsLoading(false)
            }}
          />
        </div>
        <div>
          <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg">
                {isLoading ? (
                  <Skeleton className="h-6 w-32" />
                ) : (
                  "Ticket Statistics"
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoading ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-12" />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Open Tickets</span>
                      <Badge variant="warning">
                        {tickets.filter((t: SupportTicket) => t.status !== SupportTicketStatus.CLOSED).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">Closed Tickets</span>
                      <Badge variant="success">
                        {tickets.filter((t: SupportTicket) => t.status === SupportTicketStatus.CLOSED).length}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--text-secondary)]">High Priority</span>
                      <Badge variant="destructive">
                        {tickets.filter((t: SupportTicket) => t.priority === SupportTicketPriority.HIGH || t.priority === SupportTicketPriority.URGENT).length}
                      </Badge>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        title="Ticket Details"
      >
        {selectedTicket && (
          <TicketDetails
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onTicketUpdated={handleTicketUpdated}
          />
        )}
      </Modal>
    </motion.div>
  )
}