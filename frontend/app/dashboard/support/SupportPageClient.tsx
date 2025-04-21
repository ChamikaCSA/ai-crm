'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle, Loader2, Ticket } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ApiResponse, SupportTicket, SupportTicketStatus } from '@/lib/api-types'
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { SupportWidget } from '@/components/dashboard/customer/SupportWidget'

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
      const response = await api.get<ApiResponse<SupportTicket[]>>('/api/customer/support-ticket')
      setTickets(Array.isArray(response.data) ? response.data : [])
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

  return <SupportWidget tickets={tickets} isLoading={isLoading} />
}

export default function SupportPageClient() {
  const [refreshKey, setRefreshKey] = useState(0)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Support Center</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" /> Create New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent>
            <CreateSupportTicketForm onTicketCreated={() => setRefreshKey(prev => prev + 1)} />
          </DialogContent>
        </Dialog>
      </div>
      <SupportTicketList refreshKey={refreshKey} />
    </div>
  )
}