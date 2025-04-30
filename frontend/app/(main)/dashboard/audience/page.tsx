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
  Users,
  PieChart,
  Download,
  TrendingUp,
  Target,
  AlertCircle,
  Plus,
  Filter,
  Map,
  Building2,
  Briefcase,
  GraduationCap,
  Heart
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'

interface Segment {
  id: string
  name: string
  size: number
  growth: number
  demographics: {
    age: { [key: string]: number }
    location: { [key: string]: number }
    industry: { [key: string]: number }
  }
  behavior: {
    engagement: number
    conversion: number
    retention: number
  }
}

interface AudienceMetric {
  name: string
  value: number
  trend: number
  change: number
}

export default function AudiencePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])
  const [metrics, setMetrics] = useState<AudienceMetric[]>([])

  useEffect(() => {
    fetchAudienceData()
  }, [])

  const fetchAudienceData = async () => {
    try {
      setIsLoading(true)
      // Replace with actual API call
      const mockSegments: Segment[] = [
        {
          id: '1',
          name: 'Enterprise Decision Makers',
          size: 2500,
          growth: 15.5,
          demographics: {
            age: {
              '25-34': 30,
              '35-44': 45,
              '45-54': 25
            },
            location: {
              'North America': 45,
              'Europe': 30,
              'Asia Pacific': 25
            },
            industry: {
              'Technology': 40,
              'Finance': 30,
              'Healthcare': 30
            }
          },
          behavior: {
            engagement: 75,
            conversion: 12,
            retention: 85
          }
        },
        // Add more segments
      ]

      const mockMetrics: AudienceMetric[] = [
        {
          name: 'Total Audience',
          value: 12500,
          trend: 12.5,
          change: 5.2
        },
        {
          name: 'Active Users',
          value: 8500,
          trend: 8.2,
          change: 3.1
        },
        {
          name: 'Engagement Rate',
          value: 68,
          trend: 15.5,
          change: 4.8
        }
      ]

      setSegments(mockSegments)
      setMetrics(mockMetrics)
      setError(false)
    } catch (error) {
      console.error('Failed to fetch audience data:', error)
      setError(true)
      toast.error('Failed to fetch audience data')
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
              <p>Failed to load audience data</p>
              <Button variant="outline" size="sm" onClick={fetchAudienceData} className="group">
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
                Audience Segmentation
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                AI-driven audience analysis and targeting
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Segment
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Audience
                  </CardTitle>
                  <Users className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5K</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+12.5%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Segments
                  </CardTitle>
                  <Filter className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+2 new</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Engagement
                  </CardTitle>
                  <PieChart className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68%</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+5.2%</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-[var(--card)]/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Conversion Rate
                  </CardTitle>
                  <Target className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12.5%</div>
                  <div className="flex items-center pt-1">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500 ml-1">+3.2%</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
              <Card className="col-span-4 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Audience Segments</CardTitle>
                  <CardDescription>
                    AI-driven audience segmentation and analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {segments.map((segment) => (
                      <div key={segment.id} className="p-4 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-sm font-medium">{segment.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {segment.size.toLocaleString()} members
                            </p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">
                            +{segment.growth}% growth
                          </Badge>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Age Distribution</p>
                            {Object.entries(segment.demographics.age).map(([age, percentage]) => (
                              <div key={age} className="flex items-center justify-between text-sm">
                                <span>{age}</span>
                                <span>{percentage}%</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Location</p>
                            {Object.entries(segment.demographics.location).map(([location, percentage]) => (
                              <div key={location} className="flex items-center justify-between text-sm">
                                <span>{location}</span>
                                <span>{percentage}%</span>
                              </div>
                            ))}
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Industry</p>
                            {Object.entries(segment.demographics.industry).map(([industry, percentage]) => (
                              <div key={industry} className="flex items-center justify-between text-sm">
                                <span>{industry}</span>
                                <span>{percentage}%</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="col-span-3 bg-[var(--card)]/50">
                <CardHeader>
                  <CardTitle>Behavior Analysis</CardTitle>
                  <CardDescription>
                    Audience engagement and conversion metrics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {metrics.map((metric) => (
                      <div key={metric.name} className="p-3 rounded-lg bg-[var(--card)]/50">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{metric.name}</p>
                          <Badge className={metric.trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {metric.trend > 0 ? '+' : ''}{metric.trend}%
                          </Badge>
                        </div>
                        <div className="mt-2">
                          <p className="text-2xl font-bold">{metric.value.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {metric.change > 0 ? '+' : ''}{metric.change}% change
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mt-6 bg-[var(--card)]/50">
              <CardHeader>
                <CardTitle>AI Recommendations</CardTitle>
                <CardDescription>
                  Automated audience targeting suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-start space-x-4">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2" />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-muted-foreground" />
                          <p className="text-sm font-medium leading-none">
                            Recommendation {i}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          AI-generated recommendation for audience targeting and segmentation
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