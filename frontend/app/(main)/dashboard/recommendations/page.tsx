'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Recommendation } from '@/lib/api-types'
import { Lightbulb, Target } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'

export default function RecommendationsPage() {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  if (!user) {
    redirect('/auth/login')
  }

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get<Recommendation[]>('/api/customer/recommendation')
        setRecommendations(Array.isArray(response) ? response : [])
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
        toast.error('Failed to fetch recommendations')
        setRecommendations([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

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
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-6">
              {[1, 2, 3].map((index) => (
                <div key={index} className="p-6 rounded-lg border border-[var(--border)] bg-[var(--card)]/50">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <Skeleton className="h-6 w-48" />
                          <Skeleton className="h-4 w-64 mt-2" />
                        </div>
                        <Skeleton className="h-6 w-16" />
                      </div>
                      <div className="mt-4 flex items-center gap-4">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-32" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="container mx-auto px-4 py-8 space-y-8"
    >
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-[var(--primary)]" />
              Personalized Recommendations
            </CardTitle>
            <CardDescription className="text-[var(--text-secondary)]">Discover tailored suggestions based on your activity</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Target className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-tertiary)]">
                No recommendations available at this time
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence>
                {recommendations.map((rec, index) => (
                  <motion.div
                    key={`${rec.type}-${index}`}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="p-6 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50 hover:bg-[var(--card)]/80 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-6 h-6 text-[var(--primary)]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-medium group-hover:text-[var(--primary)] transition-colors">{rec.title}</h3>
                            <p className="text-[var(--text-secondary)] mt-2">{rec.description}</p>
                          </div>
                          <Badge variant="outline" className="text-[var(--primary)] text-sm">
                            {Math.round(rec.score * 100)}% match
                          </Badge>
                        </div>
                        <div className="mt-4 flex items-center gap-4">
                          <Button variant="default" size="sm">
                            Learn More
                          </Button>
                          <Button variant="outline" size="sm">
                            Save for Later
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}