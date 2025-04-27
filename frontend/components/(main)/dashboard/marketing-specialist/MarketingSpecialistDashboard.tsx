import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, Users, Mail, Target, ArrowUp, ArrowDown } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { MarketingStats, Campaign, AudienceSegment } from '@/lib/api-types'

export function MarketingSpecialistDashboard() {
  const [stats, setStats] = useState<MarketingStats | null>(null)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [audienceSegments, setAudienceSegments] = useState<AudienceSegment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsResponse, campaignsResponse, segmentsResponse] = await Promise.all([
          api.get<MarketingStats>('/api/marketing/stats'),
          api.get<Campaign[]>('/api/marketing/campaigns'),
          api.get<AudienceSegment[]>('/api/marketing/audience-segments')
        ])

        setStats(statsResponse)
        setCampaigns(Array.isArray(campaignsResponse) ? campaignsResponse : [])
        setAudienceSegments(Array.isArray(segmentsResponse) ? segmentsResponse : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  if (isLoading) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Campaign Reach
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{(stats?.campaignReach || 0).toLocaleString()}</div>
            <p className="text-sm text-[var(--text-tertiary)]">Total impressions</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Mail className="w-6 h-6 text-[var(--primary)]" />
              Email Open Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.emailOpenRate || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Average open rate</p>
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
            <div className="text-3xl font-bold">{stats?.conversionRate || 0}%</div>
            <p className="text-sm text-[var(--text-tertiary)]">Campaign average</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              ROI
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.roi || 0}x</div>
            <p className="text-sm text-[var(--text-tertiary)]">Return on investment</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
              Campaign Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {campaigns.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No active campaigns
                  </p>
                </div>
              ) : (
                campaigns.slice(0, 5).map((campaign) => (
                  <div
                    key={campaign._id}
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
                        <p className="text-[var(--text-tertiary)]">
                          Reach: {campaign.reach.toLocaleString()}
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Engagement: {campaign.engagement}%
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Conversion: {campaign.conversion}%
                        </p>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      {new Date(campaign.startDate).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/marketing/campaigns">
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
              <Users className="w-6 h-6 text-[var(--primary)]" />
              Audience Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {audienceSegments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    No audience segments available
                  </p>
                </div>
              ) : (
                audienceSegments.slice(0, 5).map((segment) => (
                  <div
                    key={segment._id}
                    className="flex items-start gap-3 text-sm border-b border-[var(--border)] last:border-0 pb-4 last:pb-0 hover:bg-[var(--accent)]/5 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-[var(--text-primary)]">
                        {segment.name}
                      </p>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[var(--text-tertiary)]">
                          Size: {segment.size.toLocaleString()}
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Engagement: {segment.engagement}%
                        </p>
                        <p className="text-[var(--text-tertiary)]">
                          Conversion: {segment.conversion}%
                        </p>
                      </div>
                    </div>
                    <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                      Updated: {new Date(segment.lastUpdated).toLocaleDateString()}
                    </time>
                  </div>
                ))
              )}
            </div>
            <div className="mt-4">
              <Link href="/dashboard/marketing/audience">
                <Button variant="outline" size="sm" className="w-full">
                  View All Segments
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}