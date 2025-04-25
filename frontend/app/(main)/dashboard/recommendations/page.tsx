'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { Recommendation } from '@/lib/api-types'
import { Sparkles, ArrowRight } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { redirect } from 'next/navigation'

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
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-6 h-6 text-[var(--primary)]" />
            Personalized Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-tertiary)]">
                No recommendations available at this time
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {recommendations.map((rec, index) => (
                <div
                  key={`${rec.type}-${index}`}
                  className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-lg">{rec.title}</h3>
                      <p className="text-sm text-[var(--text-secondary)] mt-1">{rec.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--primary)]">
                        {Math.round(rec.score * 100)}% match
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="group">
                      Learn More
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}