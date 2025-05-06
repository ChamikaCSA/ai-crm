'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api-client'
import { LeadSource, LeadStatus, PreferredContactMethod } from '@/lib/api-types'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Edit, Mail, Phone, Building2, Briefcase, Calendar, DollarSign, Users, MapPin, BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LeadDialog } from '../lead-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'

interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  source: LeadSource;
  status: LeadStatus;
  notes: string;
  leadScore: number;
  updatedAt: string;
  preferences: {
    preferredContactMethod: PreferredContactMethod;
    preferredContactTime: string;
    interests: string[];
    budget: number;
    timeline: string;
    painPoints: string[];
    decisionMaker: boolean;
  };
  demographics: {
    industry: string;
    companySize: string;
    location: string;
    annualRevenue: number;
    employeeCount: number;
  };
  aiInsights: {
    engagementScore: number;
    conversionProbability: number;
    nextBestAction: string;
    riskFactors: string[];
    opportunityAreas: string[];
    lastScoredAt: Date;
  };
  channelHistory: {
    channel: LeadSource;
    timestamp: Date;
    interactionType: string;
    notes: string;
  }[];
}

export default function LeadViewPage() {
  const params = useParams()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [leadDetails, setLeadDetails] = useState<Lead | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchLeadDetails()
    }
  }, [params.id])

  const fetchLeadDetails = async () => {
    try {
      setIsLoading(true)
      const response = await api.get<Lead>(`/api/leads/${params.id}`)
      setLeadDetails(response)
    } catch (error) {
      console.error('Failed to fetch lead details:', error)
      toast.error('Failed to fetch lead details')
      router.push('/dashboard/leads')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: LeadStatus) => {
    const colors = {
      [LeadStatus.NEW]: 'bg-blue-100 text-blue-800',
      [LeadStatus.CONTACTED]: 'bg-yellow-100 text-yellow-800',
      [LeadStatus.QUALIFIED]: 'bg-green-100 text-green-800',
      [LeadStatus.PROPOSAL]: 'bg-purple-100 text-purple-800',
      [LeadStatus.NEGOTIATION]: 'bg-orange-100 text-orange-800',
      [LeadStatus.CLOSED_WON]: 'bg-green-100 text-green-800',
      [LeadStatus.CLOSED_LOST]: 'bg-red-100 text-red-800',
    }
    return colors[status]
  }

  const renderField = (label: string, value: any, formatter?: (val: any) => string) => {
    const displayValue = value ? (formatter ? formatter(value) : value) : 'Not specified'
    return (
      <div>
        <h4 className="text-sm font-medium text-muted-foreground">{label}</h4>
        <p className="mt-1 text-muted-foreground">{displayValue}</p>
      </div>
    )
  }

  const formatCurrency = (value: number) => `$${value.toLocaleString()}`
  const formatDate = (date: string | Date) => new Date(date).toLocaleString()
  const formatEnum = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).replace('_', ' ')

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <div className="grid grid-cols-2 gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!leadDetails) {
    return null
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/dashboard/leads')}
            className="hover:bg-secondary"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Lead Details</h1>
            <p className="text-sm text-muted-foreground">
              Last updated {formatDate(leadDetails.updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={`${getStatusColor(leadDetails.status)} text-sm px-3 py-1`}>
            {formatEnum(leadDetails.status)}
          </Badge>
          <Button
            variant="outline"
            onClick={() => setIsEditDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit Lead
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Lead Information</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="basic">Basic Info</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
                <TabsTrigger value="demographics">Demographics</TabsTrigger>
                <TabsTrigger value="insights">AI Insights</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Company</h4>
                    </div>
                    <p className="text-lg">{leadDetails.company || 'Not specified'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Briefcase className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Job Title</h4>
                    </div>
                    <p className="text-lg">{leadDetails.jobTitle || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Email</h4>
                    </div>
                    <p className="text-lg">{leadDetails.email}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Phone</h4>
                    </div>
                    <p className="text-lg">{leadDetails.phone || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <BarChart3 className="h-4 w-4" />
                    <h4 className="text-sm font-medium">Lead Score</h4>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1 bg-secondary rounded-full h-2.5">
                      <div
                        className="bg-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${leadDetails.leadScore || 0}%` }}
                      />
                    </div>
                    <span className="text-lg font-medium">{leadDetails.leadScore || 0}%</span>
                  </div>
                </div>

                {leadDetails.notes && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                      <p className="text-lg whitespace-pre-wrap">{leadDetails.notes}</p>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="preferences" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Preferred Contact Method</h4>
                    </div>
                    <p className="text-lg">{formatEnum(leadDetails.preferences?.preferredContactMethod) || 'Not specified'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Preferred Contact Time</h4>
                    </div>
                    <p className="text-lg">{leadDetails.preferences?.preferredContactTime || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Budget</h4>
                    </div>
                    <p className="text-lg">{leadDetails.preferences?.budget ? formatCurrency(leadDetails.preferences.budget) : 'Not specified'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Timeline</h4>
                    </div>
                    <p className="text-lg">{leadDetails.preferences?.timeline || 'Not specified'}</p>
                  </div>
                </div>

                {leadDetails.preferences?.painPoints?.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium text-muted-foreground">Pain Points</h4>
                      <div className="flex flex-wrap gap-2">
                        {leadDetails.preferences.painPoints.map((point, index) => (
                          <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                            {point}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </TabsContent>

              <TabsContent value="demographics" className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Industry</h4>
                    </div>
                    <p className="text-lg">{leadDetails.demographics?.industry || 'Not specified'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Company Size</h4>
                    </div>
                    <p className="text-lg">{leadDetails.demographics?.companySize || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Location</h4>
                    </div>
                    <p className="text-lg">{leadDetails.demographics?.location || 'Not specified'}</p>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <DollarSign className="h-4 w-4" />
                      <h4 className="text-sm font-medium">Annual Revenue</h4>
                    </div>
                    <p className="text-lg">{leadDetails.demographics?.annualRevenue ? formatCurrency(leadDetails.demographics.annualRevenue) : 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <h4 className="text-sm font-medium">Employee Count</h4>
                  </div>
                  <p className="text-lg">{leadDetails.demographics?.employeeCount || 'Not specified'}</p>
                </div>
              </TabsContent>

              <TabsContent value="insights" className="space-y-6">
                {leadDetails.aiInsights ? (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BarChart3 className="h-4 w-4" />
                          <h4 className="text-sm font-medium">Engagement Score</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-secondary rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${leadDetails.aiInsights.engagementScore || 0}%` }}
                              />
                            </div>
                            <span className="text-lg font-medium">{leadDetails.aiInsights.engagementScore || 0}%</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <BarChart3 className="h-4 w-4" />
                          <h4 className="text-sm font-medium">Conversion Probability</h4>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 bg-secondary rounded-full h-2.5">
                              <div
                                className="bg-primary h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${leadDetails.aiInsights.conversionProbability || 0}%` }}
                              />
                            </div>
                            <span className="text-lg font-medium">{leadDetails.aiInsights.conversionProbability || 0}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <BarChart3 className="h-4 w-4" />
                        <h4 className="text-sm font-medium">Next Best Action</h4>
                      </div>
                      <p className="text-lg">{leadDetails.aiInsights.nextBestAction || 'Not specified'}</p>
                    </div>

                    {(leadDetails.aiInsights.riskFactors?.length > 0 || leadDetails.aiInsights.opportunityAreas?.length > 0) && (
                      <>
                        <Separator />
                        <div className="grid grid-cols-2 gap-6">
                          {leadDetails.aiInsights.riskFactors?.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-muted-foreground">Risk Factors</h4>
                              <div className="flex flex-wrap gap-2">
                                {leadDetails.aiInsights.riskFactors.map((factor, index) => (
                                  <Badge key={index} variant="destructive" className="text-sm px-3 py-1">
                                    {factor}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {leadDetails.aiInsights.opportunityAreas?.length > 0 && (
                            <div className="space-y-4">
                              <h4 className="text-sm font-medium text-muted-foreground">Opportunity Areas</h4>
                              <div className="flex flex-wrap gap-2">
                                {leadDetails.aiInsights.opportunityAreas.map((area, index) => (
                                  <Badge key={index} variant="success" className="text-sm px-3 py-1">
                                    {area}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No AI insights available for this lead
                  </div>
                )}
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                {leadDetails.channelHistory?.length > 0 ? (
                  <div className="space-y-4">
                    {leadDetails.channelHistory.map((interaction, index) => (
                      <div key={index} className="flex items-start gap-4 p-4 bg-secondary/50 rounded-lg hover:bg-secondary/70 transition-colors">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-sm px-3 py-1">
                              {formatEnum(interaction.channel)}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDate(interaction.timestamp)}
                            </span>
                          </div>
                          <p className="mt-2 text-lg">{interaction.notes || 'No notes available'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No interaction history available
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start gap-2">
                <Mail className="h-4 w-4" />
                Send Email
              </Button>
              <Button className="w-full justify-start gap-2">
                <Phone className="h-4 w-4" />
                Schedule Call
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Related Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Source</h4>
                <Badge variant="outline" className="text-sm px-3 py-1">
                  {formatEnum(leadDetails.source)}
                </Badge>
              </div>
              <Separator />
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-muted-foreground">Last Updated</h4>
                <p className="text-sm">{formatDate(leadDetails.updatedAt)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <LeadDialog
        leadId={params.id as string}
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onLeadUpdated={fetchLeadDetails}
      />
    </div>
  )
}