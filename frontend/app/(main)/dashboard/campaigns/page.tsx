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
import { Loader2, Plus, Target, BarChart3, TrendingUp, Users, Clock, MessageSquare, FileText, Tag } from 'lucide-react'
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
}

interface Campaign {
  _id: string
  name: string
  description: string
  type: string
  status: string
  targetSegments: string[]
  content: {
    subject?: string
    body: string
    mediaUrls?: string[]
    callToAction: {
      text: string
      url: string
    }
  }
  schedule: {
    frequency: string
    time: string
    timezone: string
  }
  createdAt: string
  updatedAt: string
}

export default function CampaignsPage() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [segments, setSegments] = useState<Segment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [campaignToDelete, setCampaignToDelete] = useState<string | null>(null)
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: '',
    targetSegment: '',
    startDate: '',
    endDate: '',
    budget: 0,
    objectives: '',
    description: '',
    content: {
      subject: '',
      body: '',
      callToAction: {
        text: '',
        url: ''
      }
    },
    schedule: {
      frequency: 'daily',
      time: '09:00',
      timezone: 'UTC'
    }
  })

  useEffect(() => {
    fetchCampaigns()
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
      console.error('Error fetching segments:', error)
    }
  }

  const fetchCampaigns = async () => {
    try {
      const response = await fetch('/api/marketing-specialist/campaigns')
      if (!response.ok) {
        throw new Error('Failed to fetch campaigns')
      }
      const data = await response.json()
      setCampaigns(Array.isArray(data) ? data : [])
    } catch (error) {
      setError('Failed to load campaigns')
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  const createCampaign = async () => {
    try {
      setIsCreating(true)
      const response = await fetch('/api/marketing-specialist/campaigns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCampaign),
      })

      if (!response.ok) {
        throw new Error('Failed to create campaign')
      }

      await fetchCampaigns()
      setShowCreateModal(false)
      setNewCampaign({
        name: '',
        type: '',
        targetSegment: '',
        startDate: '',
        endDate: '',
        budget: 0,
        objectives: '',
        description: '',
        content: {
          subject: '',
          body: '',
          callToAction: {
            text: '',
            url: ''
          }
        },
        schedule: {
          frequency: 'daily',
          time: '09:00',
          timezone: 'UTC'
        }
      })
    } catch (error) {
      setError('Failed to create campaign')
      console.error('Error creating campaign:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const handleEditCampaign = (campaign: Campaign) => {
    setSelectedCampaign(campaign)
    setNewCampaign({
      name: campaign.name,
      type: campaign.type,
      targetSegment: campaign.targetSegments[0] || '',
      startDate: '',
      endDate: '',
      budget: 0,
      objectives: '',
      description: campaign.description,
      content: {
        subject: campaign.content.subject || '',
        body: campaign.content.body,
        callToAction: campaign.content.callToAction || { text: '', url: '' }
      },
      schedule: campaign.schedule
    })
    setShowEditModal(true)
  }

  const handleDeleteCampaign = async (campaignId: string) => {
    setCampaignToDelete(campaignId)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!campaignToDelete) return

    try {
      const response = await fetch(`/api/marketing-specialist/campaigns/${campaignToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete campaign')
      }

      setCampaigns(campaigns.filter(c => c._id !== campaignToDelete))
      setShowDeleteModal(false)
      setCampaignToDelete(null)
    } catch (error) {
      setError('Failed to delete campaign')
      console.error('Error deleting campaign:', error)
    }
  }

  const updateCampaign = async () => {
    if (!selectedCampaign) return

    try {
      const response = await fetch(`/api/marketing-specialist/campaigns/${selectedCampaign._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCampaign),
      })

      if (!response.ok) {
        throw new Error('Failed to update campaign')
      }

      const data = await response.json()
      setCampaigns(campaigns.map(c => c._id === selectedCampaign._id ? data.data : c))
      setShowEditModal(false)
      setSelectedCampaign(null)
    } catch (error) {
      setError('Failed to update campaign')
      console.error('Error updating campaign:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-[var(--success)]'
      case 'completed':
        return 'bg-[var(--info)]'
      case 'scheduled':
        return 'bg-[var(--warning)]'
      case 'paused':
        return 'bg-[var(--error)]'
      default:
        return 'bg-[var(--muted)]'
    }
  }

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign && activeTab === 'all' ? true : campaign?.status?.toLowerCase() === activeTab.toLowerCase()
  )

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
          <Button onClick={fetchCampaigns}>Retry</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Marketing Campaigns</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Campaign
        </Button>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowCreateModal(false)} />
          <Card className="w-full max-w-2xl mx-4 my-8 relative z-50">
            <CardHeader className="sticky top-0 bg-background z-10">
              <CardTitle>Create New Campaign</CardTitle>
            </CardHeader>
            <CardContent className="max-h-[calc(100vh-200px)] overflow-y-auto">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    placeholder="Enter campaign name"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Campaign Type</Label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select campaign type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="social_media">Social Media</SelectItem>
                      <SelectItem value="content">Content</SelectItem>
                      <SelectItem value="paid_advertising">Paid Advertising</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="targetSegment">Target Segment</Label>
                  <Select
                    value={newCampaign.targetSegment}
                    onValueChange={(value) => setNewCampaign({ ...newCampaign, targetSegment: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments.map((segment) => (
                        <SelectItem key={segment._id} value={segment._id}>
                          {segment.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newCampaign.startDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newCampaign.endDate}
                      onChange={(e) => setNewCampaign({ ...newCampaign, endDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="budget">Budget</Label>
                  <Input
                    id="budget"
                    type="number"
                    value={newCampaign.budget}
                    onChange={(e) => setNewCampaign({ ...newCampaign, budget: Number(e.target.value) })}
                    placeholder="Enter campaign budget"
                  />
                </div>
                <div>
                  <Label htmlFor="objectives">Campaign Objectives</Label>
                  <Textarea
                    id="objectives"
                    value={newCampaign.objectives}
                    onChange={(e) => setNewCampaign({ ...newCampaign, objectives: e.target.value })}
                    placeholder="Enter campaign objectives"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Campaign Description</Label>
                  <Textarea
                    id="description"
                    value={newCampaign.description}
                    onChange={(e) => setNewCampaign({ ...newCampaign, description: e.target.value })}
                    placeholder="Enter campaign description"
                  />
                </div>
                <div>
                  <Label htmlFor="content">Campaign Content</Label>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="contentSubject">Subject</Label>
                      <Input
                        id="contentSubject"
                        value={newCampaign.content.subject}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          content: { ...newCampaign.content, subject: e.target.value }
                        })}
                        placeholder="Enter campaign subject"
                      />
                    </div>
                    <div>
                      <Label htmlFor="contentBody">Body</Label>
                      <Textarea
                        id="contentBody"
                        value={newCampaign.content.body}
                        onChange={(e) => setNewCampaign({
                          ...newCampaign,
                          content: { ...newCampaign.content, body: e.target.value }
                        })}
                        placeholder="Enter campaign content"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="ctaText">Call to Action Text</Label>
                        <Input
                          id="ctaText"
                          value={newCampaign.content.callToAction.text}
                          onChange={(e) => setNewCampaign({
                            ...newCampaign,
                            content: {
                              ...newCampaign.content,
                              callToAction: {
                                ...newCampaign.content.callToAction,
                                text: e.target.value
                              }
                            }
                          })}
                          placeholder="Enter CTA text"
                        />
                      </div>
                      <div>
                        <Label htmlFor="ctaUrl">Call to Action URL</Label>
                        <Input
                          id="ctaUrl"
                          value={newCampaign.content.callToAction.url}
                          onChange={(e) => setNewCampaign({
                            ...newCampaign,
                            content: {
                              ...newCampaign.content,
                              callToAction: {
                                ...newCampaign.content.callToAction,
                                url: e.target.value
                              }
                            }
                          })}
                          placeholder="Enter CTA URL"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="frequency">Schedule Frequency</Label>
                    <Select
                      value={newCampaign.schedule.frequency}
                      onValueChange={(value) => setNewCampaign({
                        ...newCampaign,
                        schedule: { ...newCampaign.schedule, frequency: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Schedule Time</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newCampaign.schedule.time}
                      onChange={(e) => setNewCampaign({
                        ...newCampaign,
                        schedule: { ...newCampaign.schedule, time: e.target.value }
                      })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={newCampaign.schedule.timezone}
                      onValueChange={(value) => setNewCampaign({
                        ...newCampaign,
                        schedule: { ...newCampaign.schedule, timezone: value }
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="EST">EST</SelectItem>
                        <SelectItem value="PST">PST</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={createCampaign}
                    disabled={!newCampaign.name || !newCampaign.type || !newCampaign.targetSegment || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Campaign'
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="all" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredCampaigns.length > 0 ? (
              filteredCampaigns.map((campaign) => (
                campaign && (
                <Card key={campaign._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          <Target className="h-5 w-5" />
                          {campaign.name || 'Unnamed Campaign'}
                        </CardTitle>
                        <p className="text-sm text-gray-500 mt-1">
                          Created: {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
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
                          <p className="text-[var(--text-secondary)]">{campaign.description}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Tag className="h-4 w-4" />
                            Campaign Type
                          </h4>
                          <Badge variant="outline" className="bg-[var(--accent)]">
                            {campaign.type}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Schedule
                          </h4>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {campaign.schedule.frequency} at {campaign.schedule.time} {campaign.schedule.timezone}
                          </Badge>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Target Segments
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {campaign.targetSegments.length > 0 ? (
                            campaign.targetSegments.map((segment, index) => (
                              <Badge key={index} variant="secondary">
                                {segment}
                              </Badge>
                            ))
                          ) : (
                            <p className="text-sm text-gray-500">No segments selected</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Campaign Content
                        </h4>
                        <div className="bg-[var(--card)] p-3 rounded-lg">
                          {campaign.content.subject && (
                            <p className="font-medium mb-2">{campaign.content.subject}</p>
                          )}
                          <p className="text-[var(--text-secondary)] whitespace-pre-wrap">{campaign.content.body}</p>
                          {campaign.content.callToAction && (
                            <div className="mt-2">
                              <a
                                href={campaign.content.callToAction.url}
                                className="text-primary hover:underline"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                {campaign.content.callToAction.text}
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t">
                        <div className="text-[var(--text-tertiary)]">
                          Last updated: {new Date(campaign.updatedAt).toLocaleDateString()}
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteCampaign(campaign._id)}
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
              <div className="text-center py-8">
                <p className="text-gray-500">No {activeTab} campaigns found</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowDeleteModal(false)} />
          <Card className="w-full max-w-md mx-4 relative z-50">
            <CardHeader>
              <CardTitle>Delete Campaign</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-[var(--text-secondary)]">
                  Are you sure you want to delete this campaign? This action cannot be undone.
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