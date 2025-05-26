import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, MessageSquare, Target, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface DashboardOverview {
  campaigns: {
    active: number
    total: number
    metrics: {
      totalReach: number
      totalEngagement: number
      totalConversion: number
      totalRetention: number
    }
  }
  segments: {
    total: number
    byType: Array<{ _id: string; count: number }>
  }
  sentiment: {
    distribution: Array<{ _id: string; count: number; averageScore: number }>
    recentAnalyses: Array<{
      source: string
      sentiment: string
      score: number
      createdAt: string
    }>
  }
  recentActivity: {
    campaigns: Array<{
      name: string
      status: string
      createdAt: string
      metrics: {
        reach: number
        engagement: number
        conversion: number
      }
    }>
    segments: Array<{
      name: string
      type: string
      createdAt: string
    }>
    sentiments: Array<{
      source: string
      sentiment: string
      score: number
      createdAt: string
    }>
  }
}

export function MarketingSpecialistDashboard() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await api.get<{ success: boolean; data: DashboardOverview }>('/api/marketing-specialist')
        setOverview(response.data)
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading || !overview) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Active Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.campaigns.active}</div>
            <p className="text-sm text-[var(--text-tertiary)]">of {overview.campaigns.total} total</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Conversion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {((overview.campaigns.metrics.totalConversion / overview.campaigns.metrics.totalReach) * 100).toFixed(1)}%
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">Average conversion</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
              Sentiment Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {overview.sentiment.distribution.reduce((acc, curr) => acc + curr.averageScore, 0) /
               overview.sentiment.distribution.length || 0}
            </div>
            <p className="text-sm text-[var(--text-tertiary)]">Average sentiment</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Total Segments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overview.segments.total}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Active segments</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Target className="w-6 h-6 text-[var(--primary)]" />
              Recent Campaigns
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.recentActivity.campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">No recent campaigns</p>
                </div>
              ) : (
                overview.recentActivity.campaigns.map((campaign) => (
                  <div
                    key={campaign.name}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-[var(--text-primary)]">
                          {campaign.name}
                        </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            campaign.status === 'active'
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : campaign.status === 'scheduled'
                              ? 'bg-[var(--warning)]/10 text-[var(--warning)]'
                              : 'bg-[var(--text-tertiary)]/10 text-[var(--text-tertiary)]'
                          }`}
                        >
                          {campaign.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        {campaign.metrics ? (
                          <>
                            <p className="text-[var(--text-tertiary)]">
                              Reach: {campaign.metrics.reach?.toLocaleString() ?? 'N/A'}
                            </p>
                            <p className="text-[var(--text-tertiary)]">
                              Engagement: {campaign.metrics.engagement ?? 'N/A'}%
                            </p>
                          </>
                        ) : (
                          <p className="text-[var(--text-tertiary)]">
                            No metrics available
                          </p>
                        )}
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(campaign.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/campaigns">
                <Button variant="outline" size="sm" className="w-full">
                  View All Campaigns
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <MessageSquare className="w-6 h-6 text-[var(--primary)]" />
              Recent Sentiment Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {overview.recentActivity.sentiments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">No recent sentiment analysis</p>
                </div>
              ) : (
                overview.recentActivity.sentiments.map((sentiment, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--text-primary)]">
                          {sentiment.source}
                      </p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                            sentiment.sentiment === 'positive'
                              ? 'bg-[var(--success)]/10 text-[var(--success)]'
                              : sentiment.sentiment === 'negative'
                              ? 'bg-[var(--destructive)]/10 text-[var(--destructive)]'
                              : 'bg-[var(--warning)]/10 text-[var(--warning)]'
                          }`}
                        >
                          {sentiment.sentiment}
                        </span>
                      </div>
                      <p className="text-[var(--text-tertiary)] mt-1">
                        Score: {sentiment.score.toFixed(2)}
                      </p>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(sentiment.createdAt).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/sentiment">
                <Button variant="outline" size="sm" className="w-full">
                  View All Sentiment Analysis
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}