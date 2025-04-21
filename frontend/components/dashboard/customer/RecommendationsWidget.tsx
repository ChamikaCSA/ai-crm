'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { RecommendationsApiResponse, Recommendation } from '@/lib/api-types'

export function RecommendationsWidget() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await api.get<RecommendationsApiResponse>('/api/customer/recommendation')
        if (response?.data) {
          setRecommendations(response.data)
        } else {
          setRecommendations([])
        }
      } catch (error) {
        toast.error('Failed to fetch recommendations')
        setRecommendations([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchRecommendations()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personalized Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center text-[var(--text-tertiary)]">Loading recommendations...</div>
        ) : recommendations.length === 0 ? (
          <div className="text-center text-[var(--text-tertiary)]">
            No recommendations available at this time
          </div>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec, index) => (
              <div
                key={`${rec.type}-${index}`}
                className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)]"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium">{rec.title}</h3>
                    <p className="text-sm text-[var(--text-secondary)] mt-1">{rec.description}</p>
                  </div>
                  <div className="text-sm text-[var(--text-tertiary)]">
                    {Math.round(rec.score * 100)}% match
                  </div>
                </div>
                <div className="mt-4">
                  <Button variant="outline" size="sm">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}