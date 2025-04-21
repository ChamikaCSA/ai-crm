'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { ApiResponse, AccountDetails } from '@/lib/api-types'

export function AccountWidget() {
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAccountDetails()
  }, [])

  const fetchAccountDetails = async () => {
    try {
      const response = await api.get<ApiResponse<AccountDetails>>('/api/customer/account')
      setAccountDetails(response.data)
    } catch (error) {
      toast.error('Failed to fetch account details')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center text-[var(--text-tertiary)]">
            Loading account details...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!accountDetails) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="h-32 flex items-center justify-center text-[var(--text-tertiary)]">
            Failed to load account details
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--primary)]" />
            Account Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-[var(--text-primary)]">
                {accountDetails.user.firstName} {accountDetails.user.lastName}
              </h4>
              <p className="text-sm text-[var(--text-tertiary)]">
                {accountDetails.user.email}
                {accountDetails.user.isEmailVerified && (
                  <CheckCircle2 className="inline-block w-4 h-4 ml-1 text-[var(--success)]" />
                )}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
              <Clock className="w-4 h-4" />
              Last login: {new Date(accountDetails.accountStatus.lastLogin).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  accountDetails.accountStatus.status === 'active'
                    ? 'bg-[var(--success)]/10 text-[var(--success)]'
                    : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                }`}
              >
                {accountDetails.accountStatus.status === 'active' ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <AlertCircle className="w-3 h-3 mr-1" />
                )}
                {accountDetails.accountStatus.status}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-[var(--primary)]" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {accountDetails.recentInteractions.length === 0 ? (
            <div className="text-center text-[var(--text-tertiary)] py-8">
              No recent activity
            </div>
          ) : (
            <div className="space-y-4">
              {accountDetails.recentInteractions.map((interaction, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-3 last:pb-0"
                >
                  <div className="flex-1">
                    <p className="font-medium text-[var(--text-primary)]">
                      {interaction.type}
                    </p>
                    <p className="text-[var(--text-tertiary)]">
                      {interaction.description}
                    </p>
                  </div>
                  <time className="text-xs text-[var(--text-tertiary)]">
                    {new Date(interaction.timestamp).toLocaleDateString()}
                  </time>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}