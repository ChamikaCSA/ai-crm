'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2, Ticket, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { SupportTicket, SupportTicketStatus } from '@/lib/api-types'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function CreateSupportTicketForm({ onTicketCreated }: { onTicketCreated?: () => void }) {
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in both subject and description.')
      return
    }

    setIsLoading(true)
    try {
      await api.post('/api/customer/support-ticket', { subject, description })
      toast.success('Support ticket created successfully!')
      setSubject('')
      setDescription('')
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
      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Create New Support Ticket</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Briefly describe your issue"
            maxLength={100}
            required
            disabled={isLoading}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Provide details about the problem you are facing"
            rows={5}
            maxLength={1000}
            required
            disabled={isLoading}
          />
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
          ) : (
            'Submit Ticket'
          )}
        </Button>
      </form>
    </div>
  )
}

function SupportTicketList({ refreshKey }: { refreshKey?: number }) {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchTickets = async () => {
    setIsLoading(true)
    try {
      const response = await api.get<SupportTicket[]>('/api/customer/support-ticket')
      setTickets(Array.isArray(response) ? response : [])
    } catch (error) {
      console.error('Failed to fetch support tickets:', error)
      toast.error('Failed to load support tickets.')
      setTickets([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [refreshKey])

  return (
    <Card className="md:col-span-2 bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Ticket className="w-6 h-6 text-[var(--primary)]" />
          My Support Tickets
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? null : tickets.length === 0 ? (
          <div className="text-center py-8">
            <Ticket className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
            <p className="text-[var(--text-tertiary)]">
              You have no support tickets.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[var(--text-primary)]">
                      {ticket.subject}
                    </p>
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        ticket.status === SupportTicketStatus.RESOLVED || ticket.status === SupportTicketStatus.CLOSED
                          ? 'bg-[var(--success)]/10 text-[var(--success)]'
                          : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                      }`}
                    >
                      {ticket.status === SupportTicketStatus.RESOLVED || ticket.status === SupportTicketStatus.CLOSED ? (
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                      ) : (
                        <AlertCircle className="w-3 h-3 mr-1" />
                      )}
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-[var(--text-tertiary)]">
                    <Clock className="w-3 h-3" />
                    <time className="text-xs">
                      Opened: {new Date(ticket.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function SupportPageClient() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Support Center</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateSupportTicketForm onTicketCreated={() => {
              setRefreshKey(prev => prev + 1)
              setIsDialogOpen(false)
            }} />
          </DialogContent>
        </Dialog>
      </div>
      <SupportTicketList refreshKey={refreshKey} />
    </div>
  )
}