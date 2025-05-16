'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, MessageSquare, TrendingUp, AlertCircle, Smile, FileText, Activity, Shield, Tag, Lightbulb, Heart } from 'lucide-react'

interface SentimentAnalysis {
  _id: string
  content: string
  source: string
  sentiment: string
  score: number
  keywords: string[]
  metadata: {
    author?: string
    platform?: string
    location?: string
    url?: string
    engagement?: {
      likes: number
      shares: number
      comments: number
    }
    confidence: number
    language: string
  }
  aiInsights: {
    topics: string[]
    emotionBreakdown: {
      emotion: string
      score: number
    }[]
    actionItems: string[]
    trendAnalysis: string
    mainEmotions: string[]
    suggestedActions: string[]
  }
  createdAt: string
}

export default function SentimentPage() {
  const { user } = useAuth()
  const [analyses, setAnalyses] = useState<SentimentAnalysis[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedAnalysis, setSelectedAnalysis] = useState<SentimentAnalysis | null>(null)
  const [analysisToDelete, setAnalysisToDelete] = useState<string | null>(null)
  const [newContent, setNewContent] = useState('')
  const [selectedSource, setSelectedSource] = useState('')

  useEffect(() => {
    fetchAnalyses()
  }, [])

  const fetchAnalyses = async () => {
    try {
      const response = await fetch('/api/marketing-specialist/sentiment')
      if (!response.ok) {
        throw new Error('Failed to fetch sentiment analyses')
      }
      const data = await response.json()
      setAnalyses(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Failed to load sentiment analyses')
      console.error('Error fetching sentiment analyses:', error)
    } finally {
      setLoading(false)
    }
  }

  const analyzeSentiment = async () => {
    if (!newContent || !selectedSource) return

    try {
      const response = await fetch('/api/marketing-specialist/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newContent,
          source: selectedSource,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to analyze sentiment')
      }

      const data = await response.json()
      const newAnalysis = {
        ...data.data,
        _id: data.data.id || data.data._id // Handle both id and _id
      }
      setAnalyses([newAnalysis, ...analyses])
      setNewContent('')
      setSelectedSource('')
    } catch (error) {
      setError('Failed to analyze sentiment')
      console.error('Error analyzing sentiment:', error)
    }
  }

  const getSentimentColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'positive':
        return 'bg-[var(--success)]'
      case 'negative':
        return 'bg-[var(--error)]'
      case 'neutral':
        return 'bg-[var(--muted)]'
      default:
        return 'bg-[var(--muted)]'
    }
  }

  const handleViewAnalysis = (analysis: SentimentAnalysis) => {
    setSelectedAnalysis(analysis)
    setShowViewModal(true)
  }

  const handleDeleteAnalysis = async (analysisId: string) => {
    setAnalysisToDelete(analysisId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!analysisToDelete) return

    try {
      const response = await fetch(`/api/marketing-specialist/sentiment/${analysisToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete analysis')
      }

      setAnalyses(analyses.filter(a => a._id !== analysisToDelete))
      setShowDeleteModal(false)
      setAnalysisToDelete(null)
    } catch (error) {
      setError('Failed to delete analysis')
      console.error('Error deleting analysis:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Sentiment Analysis</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Analyze New Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Enter content to analyze..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Source</label>
              <Select value={selectedSource} onValueChange={setSelectedSource}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social_media">Social Media</SelectItem>
                  <SelectItem value="customer_feedback">Customer Feedback</SelectItem>
                  <SelectItem value="reviews">Reviews</SelectItem>
                  <SelectItem value="support_tickets">Support Tickets</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={analyzeSentiment} disabled={!newContent || !selectedSource}>
              Analyze Sentiment
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4">
        {analyses && analyses.length > 0 ? (
          analyses.map((analysis) => (
            analysis && (
              <Card key={`sentiment-${analysis._id}`} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Sentiment Analysis
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(analysis.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getSentimentColor(analysis.sentiment)}>
                      {analysis.sentiment}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Content
                      </h4>
                      <div className="bg-[var(--card)] p-3 rounded-lg">
                        <p className="text-[var(--text-secondary)]">{analysis.content}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Sentiment Score
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-[var(--accent)] rounded-full">
                            <div
                              className="h-full bg-[var(--primary)] rounded-full"
                              style={{ width: `${analysis.score * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(analysis.score * 100)}%</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Confidence
                        </h4>
                        <div className="flex items-center gap-2">
                          <div className="w-full h-2 bg-[var(--accent)] rounded-full">
                            <div
                              className="h-full bg-[var(--success)] rounded-full"
                              style={{ width: `${analysis.metadata.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium">{Math.round(analysis.metadata.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords.map((keyword, index) => (
                          <Badge key={index} variant="secondary">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Main Emotions
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.aiInsights.mainEmotions.map((emotion, index) => (
                          <Badge key={index} variant="outline" className="bg-[var(--accent)]">
                            {emotion}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Suggested Actions
                      </h4>
                      <div className="bg-[var(--card)] p-3 rounded-lg">
                        <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                          {analysis.aiInsights.suggestedActions.map((action, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-[var(--primary)]">•</span>
                              <span>{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Trend Analysis
                      </h4>
                      <div className="bg-[var(--card)] p-3 rounded-lg">
                        <p className="text-[var(--text-secondary)]">{analysis.aiInsights.trendAnalysis}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{analysis.source}</Badge>
                        <Badge variant="outline">{analysis.metadata.language}</Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteAnalysis(analysis._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No sentiment analyses available
          </div>
        )}
      </div>

      {/* View Analysis Modal */}
      {showViewModal && selectedAnalysis && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowViewModal(false)} />
          <Card className="w-full max-w-2xl mx-4 my-8 relative z-50">
            <CardHeader className="sticky top-0 bg-background z-10">
              <CardTitle>Sentiment Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Content</h4>
                  <div className="bg-[var(--card)] p-3 rounded-lg">
                    <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{selectedAnalysis.content}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Sentiment</h4>
                  <Badge className={getSentimentColor(selectedAnalysis.sentiment)}>
                    {selectedAnalysis.sentiment}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Sentiment Score</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-[var(--accent)] rounded-full">
                        <div
                          className="h-full bg-[var(--primary)] rounded-full"
                          style={{ width: `${selectedAnalysis.score * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(selectedAnalysis.score * 100)}%</span>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Confidence</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-full h-2 bg-[var(--accent)] rounded-full">
                        <div
                          className="h-full bg-[var(--success)] rounded-full"
                          style={{ width: `${selectedAnalysis.metadata.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium">{Math.round(selectedAnalysis.metadata.confidence * 100)}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Keywords</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.keywords.map((keyword, index) => (
                      <Badge key={index} variant="secondary">
                        {keyword}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Main Emotions</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAnalysis.aiInsights.mainEmotions.map((emotion, index) => (
                      <Badge key={index} variant="outline" className="bg-[var(--accent)]">
                        {emotion}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Suggested Actions</h4>
                  <div className="bg-[var(--card)] p-3 rounded-lg">
                    <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                      {selectedAnalysis.aiInsights.suggestedActions.map((action, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-[var(--primary)]">•</span>
                          <span>{action}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Trend Analysis</h4>
                  <div className="bg-[var(--card)] p-3 rounded-lg">
                    <p className="text-[var(--text-secondary)]">{selectedAnalysis.aiInsights.trendAnalysis}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Metadata</h4>
                  <div className="bg-[var(--card)] p-3 rounded-lg">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-[var(--text-tertiary)]">Source</p>
                        <p className="text-[var(--text-secondary)]">{selectedAnalysis.source}</p>
                      </div>
                      <div>
                        <p className="text-sm text-[var(--text-tertiary)]">Language</p>
                        <p className="text-[var(--text-secondary)]">{selectedAnalysis.metadata.language}</p>
                      </div>
                      {selectedAnalysis.metadata.author && (
                        <div>
                          <p className="text-sm text-[var(--text-tertiary)]">Author</p>
                          <p className="text-[var(--text-secondary)]">{selectedAnalysis.metadata.author}</p>
                        </div>
                      )}
                      {selectedAnalysis.metadata.platform && (
                        <div>
                          <p className="text-sm text-[var(--text-tertiary)]">Platform</p>
                          <p className="text-[var(--text-secondary)]">{selectedAnalysis.metadata.platform}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setShowViewModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <Card className="w-full max-w-md mx-4 relative z-50">
            <CardHeader>
              <CardTitle>Delete Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  Are you sure you want to delete this sentiment analysis? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}