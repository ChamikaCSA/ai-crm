'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatStatus, getStatusColor, getStatusIcon } from '@/lib/lead-utils'
import { Badge } from '@/components/ui/badge'
import { motion, AnimatePresence } from 'framer-motion'
import { containerVariants, itemVariants } from '@/lib/animations'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, TrendingUp, Users, DollarSign, Percent } from 'lucide-react'
import { Button } from '@/components/ui/button'

type PipelineStage = {
  stage: string
  count: number
  value: number
  conversionRate: number
}

export default function PipelinePage() {
  const [pipelineData, setPipelineData] = useState<PipelineStage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPipelineData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/sales-manager/pipeline')
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch pipeline data')
      }
      const data = await response.json()
      setPipelineData(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast.error('Failed to fetch pipeline data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPipelineData()
  }, [])

  if (loading) {
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
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
              <Skeleton className="h-[400px] w-full" />
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
              <p>Failed to load pipeline data</p>
              <Button variant="outline" size="sm" onClick={fetchPipelineData} className="group">
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalValue = pipelineData.reduce((sum, stage) => sum + stage.value, 0)
  const totalLeads = pipelineData.reduce((sum, stage) => sum + stage.count, 0)

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
                <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                Sales Pipeline
              </CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">
                Track and manage your sales pipeline stages and performance
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Pipeline Value</CardTitle>
                    <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Across {pipelineData.length} stages
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Leads</CardTitle>
                    <Users className="h-4 w-4 text-[var(--text-secondary)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalLeads}</div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Active in pipeline
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Deal Size</CardTitle>
                    <DollarSign className="h-4 w-4 text-[var(--text-secondary)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      ${(totalValue / totalLeads || 0).toLocaleString()}
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Per lead
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                    <Percent className="h-4 w-4 text-[var(--text-secondary)]" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {((pipelineData[pipelineData.length - 1]?.conversionRate || 0)).toFixed(1)}%
                    </div>
                    <p className="text-xs text-[var(--text-secondary)]">
                      Overall pipeline
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            <div className="mt-8 space-y-8">
              <motion.div variants={itemVariants}>
                <Card>
                  <CardHeader>
                    <CardTitle>Pipeline Stages</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {pipelineData.map((stage) => (
                        <div key={stage.stage} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className={getStatusColor(stage.stage)}>
                                  {formatStatus(stage.stage)}
                                </Badge>
                              </div>
                              <p className="text-sm text-[var(--text-secondary)] mt-1">
                                {stage.count} leads • ${stage.value.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-sm font-medium">
                              {(stage.conversionRate).toFixed(1)}%
                            </div>
                          </div>
                          <Progress
                            value={stage.conversionRate}
                            className={`[&>div]:${getStatusColor(stage.stage).split(' ')[1]}`}
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Tabs defaultValue="value" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="value">Pipeline Value</TabsTrigger>
                    <TabsTrigger value="leads">Lead Count</TabsTrigger>
                    <TabsTrigger value="conversion">Conversion Rate</TabsTrigger>
                  </TabsList>

                  <TabsContent value="value">
                    <Card>
                      <CardHeader>
                        <CardTitle>Pipeline Value by Stage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipelineData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="stage"
                                tickFormatter={(value) => formatStatus(value)}
                              />
                              <YAxis />
                              <Tooltip
                                formatter={(value: number) => [`$${value.toLocaleString()}`, 'Value']}
                                labelFormatter={(label) => formatStatus(label)}
                              />
                              <Bar dataKey="value" fill="var(--primary)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="leads">
                    <Card>
                      <CardHeader>
                        <CardTitle>Lead Count by Stage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipelineData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="stage"
                                tickFormatter={(value) => formatStatus(value)}
                              />
                              <YAxis />
                              <Tooltip
                                formatter={(value: number) => [value.toLocaleString(), 'Leads']}
                                labelFormatter={(label) => formatStatus(label)}
                              />
                              <Bar dataKey="count" fill="var(--primary)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="conversion">
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversion Rate by Stage</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={pipelineData}>
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis
                                dataKey="stage"
                                tickFormatter={(value) => formatStatus(value)}
                              />
                              <YAxis />
                              <Tooltip
                                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Conversion Rate']}
                                labelFormatter={(label) => formatStatus(label)}
                              />
                              <Bar dataKey="conversionRate" fill="var(--primary)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}