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
  BarChart,
  LineChart,
  PieChart,
  Users,
  TrendingUp,
  MessageSquare,
  AlertCircle,
  Download,
  Filter,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AnalyticsMetric {
  name: string
  value: number
  trend: number
  change: number
}

interface SentimentData {
  category: string
  positive: number
  neutral: number
  negative: number
}

interface CampaignPerformance {
  name: string
  reach: number
  engagement: number
  conversion: number
}

export default function AnalyticsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([])
  const [sentiment, setSentiment] = useState<SentimentData[]>([])
  const [campaigns, setCampaigns] = useState<CampaignPerformance[]>([])

  useEffect(() => {
    // Check if user has required role
    if (!user?.role || !['marketing_specialist', 'admin'].includes(user.role)) {
      router.push('/dashboard')
      return
    }
    fetchAnalyticsData()
  }, [user, router])

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockMetrics: AnalyticsMetric[] = [
        {
          name: 'Total Engagement',
          value: 12500,
          trend: 12.5,
          change: 8.2
        },
        {
          name: 'Conversion Rate',
          value: 3.2,
          trend: -2.1,
          change: -0.5
        },
        {
          name: 'Customer Satisfaction',
          value: 4.5,
          trend: 0.3,
          change: 0.1
        },
        {
          name: 'Social Reach',
          value: 45000,
          trend: 15.8,
          change: 12.3
        }
      ]

      const mockSentiment: SentimentData[] = [
        {
          category: 'Social Media',
          positive: 65,
          neutral: 25,
          negative: 10
        },
        {
          category: 'Customer Reviews',
          positive: 75,
          neutral: 15,
          negative: 10
        },
        {
          category: 'Support Tickets',
          positive: 45,
          neutral: 35,
          negative: 20
        }
      ]

      const mockCampaigns: CampaignPerformance[] = [
        {
          name: 'Summer Sale',
          reach: 25000,
          engagement: 4500,
          conversion: 320
        },
        {
          name: 'Product Launch',
          reach: 35000,
          engagement: 7800,
          conversion: 560
        },
        {
          name: 'Holiday Special',
          reach: 42000,
          engagement: 9200,
          conversion: 680
        }
      ]

      setMetrics(mockMetrics)
      setSentiment(mockSentiment)
      setCampaigns(mockCampaigns)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
      setError(true)
      toast.error('Failed to fetch analytics data')
    } finally {
      setIsLoading(false)
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
              <p>Failed to load analytics data</p>
              <Button variant="outline" size="sm" onClick={fetchAnalyticsData} className="group">
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
                <BarChart className="w-6 h-6 text-[var(--primary)]" />
                Analytics Dashboard
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Marketing performance and customer insights
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Export
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
                    {metric.name.includes('Engagement') ? (
                      <Users className="h-4 w-4" />
                    ) : metric.name.includes('Conversion') ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : metric.name.includes('Satisfaction') ? (
                      <MessageSquare className="h-4 w-4" />
                    ) : (
                      <Activity className="h-4 w-4" />
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metric.name.includes('Rate') || metric.name.includes('Satisfaction')
                        ? `${metric.value}%`
                        : metric.value.toLocaleString()}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center">
                        {metric.trend > 0 ? (
                          <ArrowUpRight className="h-4 w-4 text-green-500" />
                        ) : (
                          <ArrowDownRight className="h-4 w-4 text-red-500" />
                        )}
                        <span className={`text-sm ml-1 ${metric.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {metric.trend > 0 ? '+' : ''}{metric.trend}%
                        </span>
                      </div>
                      <Badge variant="outline">
                        {metric.change > 0 ? '+' : ''}{metric.change}%
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Campaign Performance</CardTitle>
                  <CardDescription>
                    Recent campaign metrics and engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.name} className="p-4 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Activity className="w-4 h-4 text-muted-foreground" />
                            <p className="text-sm font-medium">{campaign.name}</p>
                          </div>
                          <Badge variant="outline">
                            {((campaign.conversion / campaign.reach) * 100).toFixed(1)}% Conv.
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">Reach</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.reach.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">Engagement</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.engagement.toLocaleString()}
                            </p>
                          </div>
                          <div className="p-3 rounded-lg bg-[var(--card)]/50">
                            <p className="text-sm font-medium">Conversions</p>
                            <p className="text-sm text-muted-foreground">
                              {campaign.conversion.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Sentiment Analysis</CardTitle>
                  <CardDescription>
                    Customer feedback and social media sentiment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sentiment.map((data) => (
                      <div key={data.category} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-medium">{data.category}</p>
                          <Badge variant="outline">
                            {data.positive}% Positive
                          </Badge>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div
                            className="h-2 rounded-full bg-green-500"
                            style={{ width: `${data.positive}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Positive: {data.positive}%</span>
                          <span>Neutral: {data.neutral}%</span>
                          <span>Negative: {data.negative}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>AI Insights</CardTitle>
                <CardDescription>
                  Automated analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      insight: 'High engagement on social media posts during evening hours',
                      impact: 'positive',
                      recommendation: 'Schedule more posts during 6-9 PM'
                    },
                    {
                      insight: 'Email campaign open rates declining',
                      impact: 'negative',
                      recommendation: 'Review subject lines and timing'
                    },
                    {
                      insight: 'Strong conversion rates from mobile users',
                      impact: 'positive',
                      recommendation: 'Optimize mobile experience further'
                    }
                  ].map((item, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className={`w-2 h-2 rounded-full mt-2 ${item.impact === 'positive' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {item.insight}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Recommendation: {item.recommendation}
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