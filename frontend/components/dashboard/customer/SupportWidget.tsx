'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Ticket } from 'lucide-react'
import { SupportTicket, SupportTicketStatus } from '@/lib/api-types'

interface SupportWidgetProps {
  tickets: SupportTicket[]
  isLoading?: boolean
  title?: string
}

export function SupportWidget({
  tickets,
  isLoading = false,
  title = 'My Support Tickets'
}: SupportWidgetProps) {
  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Ticket className="w-5 h-5 text-[var(--primary)]" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-32 flex items-center justify-center text-[var(--text-tertiary)]">
            Loading tickets...
          </div>
        ) : tickets.length === 0 ? (
          <div className="text-center text-[var(--text-tertiary)] py-8">
            You have no support tickets.
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.map((ticket) => (
              <div
                key={ticket._id}
                className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-3 last:pb-0"
              >
                <div className="flex-1">
                  <p className="font-medium text-[var(--text-primary)]">
                    {ticket.subject}
                  </p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    Status: <span className={`font-semibold ${ticket.status === SupportTicketStatus.RESOLVED || ticket.status === SupportTicketStatus.CLOSED ? 'text-[var(--success)]' : 'text-[var(--warning)]'}`}>{ticket.status.replace('_', ' ')}</span>
                  </p>
                </div>
                <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                  Opened: {new Date(ticket.createdAt).toLocaleDateString()}
                </time>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}