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
  Megaphone,
  BarChart,
  Download,
  TrendingUp,
  Users,
  AlertCircle,
  Plus,
  Mail,
  MessageSquare,
  Share2,
  Target
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface Campaign {
  id: string
  name: string
  type: 'email' | 'social' | 'content'
  status: 'active' | 'paused' | 'completed'
  metrics: {
    reach: number
    engagement: number
    conversion: number
    roi: number
  }
  targetAudience: string
  startDate: string
  endDate: string
}

export default function CampaignsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [campaigns, setCampaigns] = useState<Campaign[]>([])

  useEffect(() => {
    fetchCampaignData()
  }, [])

  const fetchCampaignData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockCampaigns: Campaign[] = [
        {
          id: '1',
          name: 'Q2 Product Launch',
          type: 'email',
          status: 'active',
          metrics: {
            reach: 15000,
            engagement: 32,
            conversion: 8.5,
            roi: 245
          },
          targetAudience: 'Enterprise Customers',
          startDate: '2024-04-01',
          endDate: '2024-06-30'
        },
        // Add more campaigns
      ]

      setCampaigns(mockCampaigns)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch campaign data:', error)
      setError(true)
      toast.error('Failed to fetch campaign data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: Campaign['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      paused: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
    }
    return colors[status]
  }

  const getTypeIcon = (type: Campaign['type']) => {
    const icons = {
      email: Mail,
      social: Share2,
      content: MessageSquare,
    }
    return icons[type]
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
              <p>Failed to load campaign data</p>
              <Button variant="outline" size="sm" onClick={fetchCampaignData} className="group">
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
                <Megaphone className="w-6 h-6 text-[var(--primary)]" />
                Marketing Campaigns
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Manage and track your marketing campaigns
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Report
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Campaign
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Campaigns
                  </CardTitle>
                  <Megaphone className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+2 new</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Reach
                  </CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">45.2K</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+12.5%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Engagement
                  </CardTitle>
                  <BarChart className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">32.5%</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+5.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    ROI
                  </CardTitle>
                  <Target className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">245%</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+18.5%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                  <CardDescription>
                    Current marketing campaigns and their performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.map((campaign) => {
                      const TypeIcon = getTypeIcon(campaign.type)
                      return (
                        <div key={campaign.id} className="flex items-center justify-between p-4 rounded-lg bg-[var(--card)]/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                              <TypeIcon className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <p className="text-sm font-medium">{campaign.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {campaign.targetAudience} • {campaign.startDate} - {campaign.endDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-sm font-medium">${campaign.metrics.roi}% ROI</p>
                              <p className="text-xs text-muted-foreground">
                                {campaign.metrics.engagement}% engagement
                              </p>
                            </div>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>
                    Campaign optimization suggestions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                          <div>
                            <p className="text-sm font-medium">
                              Insight {i}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              AI-generated insight about campaign performance and optimization
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>Campaign Timeline</CardTitle>
                <CardDescription>
                  Upcoming and past campaign events
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Megaphone className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium leading-none">
                            Campaign Event {i}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Description of campaign event {i}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date().toLocaleDateString()}
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