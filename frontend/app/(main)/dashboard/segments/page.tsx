'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Users, Target, BarChart3, TrendingUp, Lightbulb, Activity, FileText } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

interface Segment {
  _id: string
  name: string
  type: string
  criteria: any
  aiInsights: {
    keyCharacteristics: string[]
    recommendations: string[]
    predictedBehavior: string[]
  }
  createdAt: string
  updatedAt: string
  description: string
  customerIds: string[]
}

export default function SegmentsPage() {
  const { user } = useAuth()
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null)
  const [segmentToDelete, setSegmentToDelete] = useState<string | null>(null)
  const [newSegment, setNewSegment] = useState({
    name: '',
    type: '',
    description: '',
    criteria: {},
  })

  useEffect(() => {
    fetchSegments()
  }, [])

  const fetchSegments = async () => {
    try {
      const response = await fetch('/api/marketing-specialist/segments')
      if (!response.ok) {
        throw new Error('Failed to fetch segments')
      }
      const data = await response.json()
      setSegments(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Failed to load segments')
      console.error('Error fetching segments:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSegment = async () => {
    try {
      const response = await fetch('/api/marketing-specialist/segments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSegment),
      })

      if (!response.ok) {
        throw new Error('Failed to create segment')
      }

      const data = await response.json()
      setSegments([data.data, ...segments])
      setShowCreateModal(false)
      setNewSegment({ name: '', type: '', description: '', criteria: {} })
    } catch (error) {
      setError('Failed to create segment')
      console.error('Error creating segment:', error)
    }
  }

  const handleEditSegment = (segment: Segment) => {
    setSelectedSegment(segment)
    setNewSegment({
      name: segment.name,
      type: segment.type,
      description: segment.description,
      criteria: segment.criteria
    })
    setShowEditModal(true)
  }

  const handleDeleteSegment = async (segmentId: string) => {
    setSegmentToDelete(segmentId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!segmentToDelete) return

    try {
      const response = await fetch(`/api/marketing-specialist/segments/${segmentToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete segment')
      }

      setSegments(segments.filter(s => s._id !== segmentToDelete))
      setShowDeleteModal(false)
      setSegmentToDelete(null)
    } catch (error) {
      setError('Failed to delete segment')
      console.error('Error deleting segment:', error)
    }
  }

  const updateSegment = async () => {
    if (!selectedSegment) return

    try {
      const response = await fetch(`/api/marketing-specialist/segments/${selectedSegment._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSegment),
      })

      if (!response.ok) {
        throw new Error('Failed to update segment')
      }

      const data = await response.json()
      setSegments(segments.map(s => s._id === selectedSegment._id ? data.data : s))
      setShowEditModal(false)
      setSelectedSegment(null)
    } catch (error) {
      setError('Failed to update segment')
      console.error('Error updating segment:', error)
    }
  }

  const getSegmentTypeColor = (type: string | undefined) => {
    if (!type) return 'bg-[var(--muted)]';

    switch (type.toLowerCase()) {
      case 'demographic':
        return 'bg-[var(--info)]'
      case 'behavioral':
        return 'bg-[var(--success)]'
      case 'psychographic':
        return 'bg-[var(--primary)]'
      default:
        return 'bg-[var(--muted)]'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={fetchSegments}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Customer Segments</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Segment
        </Button>
      </div>

      {/* Create Segment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle>Create New Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Segment Name</Label>
                  <Input
                    id="name"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    placeholder="Enter segment name"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSegment.description}
                    onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                    placeholder="Enter segment description"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Segment Type</Label>
                  <Select
                    value={newSegment.type}
                    onValueChange={(value) => setNewSegment({ ...newSegment, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demographic">Demographic</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="psychographic">Psychographic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createSegment}
                    disabled={!newSegment.name || !newSegment.type || !newSegment.description}
                  >
                    Create Segment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Segments</TabsTrigger>
          <TabsTrigger value="demographic">Demographic</TabsTrigger>
          <TabsTrigger value="behavioral">Behavioral</TabsTrigger>
          <TabsTrigger value="psychographic">Psychographic</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {segments.map((segment) => (
              <Card key={segment._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        {segment.name}
                      </CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        Created: {new Date(segment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge className={getSegmentTypeColor(segment.type)}>
                      {segment.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h4>
                      <div className="bg-[var(--card)] p-3 rounded-lg">
                        <p className="text-[var(--text-secondary)]">{segment.description}</p>
                      </div>
                    </div>

                    {segment.aiInsights && (
                      <>
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <BarChart3 className="h-4 w-4" />
                            Key Characteristics
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {segment.aiInsights.keyCharacteristics?.map((char, index) => (
                              <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {char}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Lightbulb className="h-4 w-4" />
                            AI Recommendations
                          </h4>
                          <div className="bg-[var(--card)] p-3 rounded-lg">
                            <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                              {segment.aiInsights.recommendations?.map((rec, index) => (
                                <li key={index} className="flex items-start gap-2">
                                  <span className="text-[var(--primary)]">•</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Activity className="h-4 w-4" />
                            Predicted Behavior
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {segment.aiInsights.predictedBehavior?.map((behavior, index) => (
                              <Badge key={index} variant="outline" className="bg-[var(--accent)]">
                                {behavior}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex justify-between items-center pt-4 border-t">
                      <div className="text-[var(--text-tertiary)]">
                        {segment.customerIds?.length || 0} customers in segment
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-600"
                          onClick={() => handleDeleteSegment(segment._id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="demographic" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {segments
              .filter(segment => segment.type.toLowerCase() === 'demographic')
              .map((segment) => (
                <Card key={segment._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {segment.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(segment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getSegmentTypeColor(segment.type)}>
                        {segment.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </h4>
                        <div className="bg-[var(--card)] p-3 rounded-lg">
                          <p className="text-[var(--text-secondary)]">{segment.description}</p>
                        </div>
                      </div>

                      {segment.aiInsights && (
                        <>
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Key Characteristics
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {segment.aiInsights.keyCharacteristics?.map((char, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              AI Recommendations
                            </h4>
                            <div className="bg-[var(--card)] p-3 rounded-lg">
                              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                                {segment.aiInsights.recommendations?.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-[var(--primary)]">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Predicted Behavior
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {segment.aiInsights.predictedBehavior?.map((behavior, index) => (
                                <Badge key={index} variant="outline" className="bg-[var(--accent)]">
                                  {behavior}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-[var(--text-tertiary)]">
                          {segment.customerIds?.length || 0} customers in segment
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteSegment(segment._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="behavioral" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {segments
              .filter(segment => segment.type.toLowerCase() === 'behavioral')
              .map((segment) => (
                <Card key={segment._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {segment.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(segment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getSegmentTypeColor(segment.type)}>
                        {segment.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </h4>
                        <div className="bg-[var(--card)] p-3 rounded-lg">
                          <p className="text-[var(--text-secondary)]">{segment.description}</p>
                        </div>
                      </div>

                      {segment.aiInsights && (
                        <>
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Key Characteristics
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {segment.aiInsights.keyCharacteristics?.map((char, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              AI Recommendations
                            </h4>
                            <div className="bg-[var(--card)] p-3 rounded-lg">
                              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                                {segment.aiInsights.recommendations?.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-[var(--primary)]">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Predicted Behavior
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {segment.aiInsights.predictedBehavior?.map((behavior, index) => (
                                <Badge key={index} variant="outline" className="bg-[var(--accent)]">
                                  {behavior}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-[var(--text-tertiary)]">
                          {segment.customerIds?.length || 0} customers in segment
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteSegment(segment._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="psychographic" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {segments
              .filter(segment => segment.type.toLowerCase() === 'psychographic')
              .map((segment) => (
                <Card key={segment._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Users className="h-5 w-5" />
                          {segment.name}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(segment.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getSegmentTypeColor(segment.type)}>
                        {segment.type}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          Description
                        </h4>
                        <div className="bg-[var(--card)] p-3 rounded-lg">
                          <p className="text-[var(--text-secondary)]">{segment.description}</p>
                        </div>
                      </div>

                      {segment.aiInsights && (
                        <>
                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <BarChart3 className="h-4 w-4" />
                              Key Characteristics
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {segment.aiInsights.keyCharacteristics?.map((char, index) => (
                                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                                  <TrendingUp className="h-3 w-3" />
                                  {char}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Lightbulb className="h-4 w-4" />
                              AI Recommendations
                            </h4>
                            <div className="bg-[var(--card)] p-3 rounded-lg">
                              <ul className="list-disc list-inside text-[var(--text-secondary)] space-y-1">
                                {segment.aiInsights.recommendations?.map((rec, index) => (
                                  <li key={index} className="flex items-start gap-2">
                                    <span className="text-[var(--primary)]">•</span>
                                    <span>{rec}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold mb-2 flex items-center gap-2">
                              <Activity className="h-4 w-4" />
                              Predicted Behavior
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {segment.aiInsights.predictedBehavior?.map((behavior, index) => (
                                <Badge key={index} variant="outline" className="bg-[var(--accent)]">
                                  {behavior}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-[var(--text-tertiary)]">
                          {segment.customerIds?.length || 0} customers in segment
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteSegment(segment._id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Segment Modal */}
      {showEditModal && selectedSegment && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowEditModal(false)} />
          <Card className="w-full max-w-2xl mx-4 my-8 relative z-50">
            <CardHeader className="sticky top-0 bg-background z-10">
              <CardTitle>Edit Segment</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Segment Name</Label>
                  <Input
                    id="edit-name"
                    value={newSegment.name}
                    onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                    placeholder="Enter segment name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-type">Segment Type</Label>
                  <Select
                    value={newSegment.type}
                    onValueChange={(value) => setNewSegment({ ...newSegment, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select segment type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="demographic">Demographic</SelectItem>
                      <SelectItem value="behavioral">Behavioral</SelectItem>
                      <SelectItem value="psychographic">Psychographic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={newSegment.description}
                    onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                    placeholder="Enter segment description"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowEditModal(false)}>
                    Cancel
                  </Button>
                  <Button onClick={updateSegment}>
                    Update Segment
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
              <CardTitle>Delete Segment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  Are you sure you want to delete this segment? This action cannot be undone.
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