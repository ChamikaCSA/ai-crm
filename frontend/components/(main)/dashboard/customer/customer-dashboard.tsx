'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, Clock, CheckCircle2, AlertCircle, Activity, Ticket, Bell, Settings, Lightbulb, MessageSquare, Mail, LogIn, FileText, Zap } from 'lucide-react'
import { api } from '@/lib/api-client'
import { toast } from 'sonner'
import { AccountDetails, SupportTicket, SupportTicketStatus, Recommendation, InteractionType } from '@/lib/api-types'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ProfilePicture } from '@/components/profile-picture'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Skeleton } from '@/components/ui/skeleton'
import { containerVariants, itemVariants } from '@/lib/animations'

const getInteractionIcon = (type: InteractionType) => {
  switch (type) {
    case InteractionType.CHAT:
      return MessageSquare;
    case InteractionType.EMAIL:
      return Mail;
    case InteractionType.SUPPORT_TICKET:
      return Ticket;
    case InteractionType.SYSTEM:
      return Settings;
    case InteractionType.LOGIN:
      return LogIn;
    case InteractionType.SETTINGS_UPDATE:
      return Settings;
    case InteractionType.PROFILE_UPDATE:
      return User;
    case InteractionType.DOCUMENT_VIEW:
      return FileText;
    case InteractionType.FEATURE_USAGE:
      return Zap;
    default:
      return Activity;
  }
};

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
const RECOMMENDATIONS_CACHE_KEY = 'customer_recommendations_cache';

interface CachedRecommendations {
  recommendations: Recommendation[];
  timestamp: number;
}

const getCachedRecommendations = (): CachedRecommendations | null => {
  const cached = localStorage.getItem(RECOMMENDATIONS_CACHE_KEY);
  if (!cached) return null;

  const parsed = JSON.parse(cached) as CachedRecommendations;
  const now = Date.now();

  if (now - parsed.timestamp > CACHE_DURATION) {
    localStorage.removeItem(RECOMMENDATIONS_CACHE_KEY);
    return null;
  }

  return parsed;
};

const setCachedRecommendations = (recommendations: Recommendation[]) => {
  const cache: CachedRecommendations = {
    recommendations,
    timestamp: Date.now()
  };
  localStorage.setItem(RECOMMENDATIONS_CACHE_KEY, JSON.stringify(cache));
};

export function CustomerDashboard() {
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null)
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([])
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRecommendationsLoading, setIsRecommendationsLoading] = useState(true)
  const [expandedDescriptions, setExpandedDescriptions] = useState<{ [key: string]: boolean }>({})

  const toggleDescription = (recId: string) => {
    setExpandedDescriptions(prev => ({
      ...prev,
      [recId]: !prev[recId]
    }))
  }

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [accountResponse, ticketsResponse] = await Promise.all([
          api.get<AccountDetails>('/api/users/account'),
          api.get<SupportTicket[]>('/api/customer/support-ticket')
        ])

        setAccountDetails(accountResponse)
        setSupportTickets(Array.isArray(ticketsResponse) ? ticketsResponse : [])
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setIsLoading(false)
      }
    }

    const fetchRecommendations = async () => {
      try {
        // Check cache first
        const cached = getCachedRecommendations();
        if (cached) {
          setRecommendations(cached.recommendations);
          setIsRecommendationsLoading(false);
          return;
        }

        // If no cache or expired, fetch from API
        const recommendationsResponse = await api.get<Recommendation[]>('/api/customer/recommendation')
        const recommendations = Array.isArray(recommendationsResponse) ? recommendationsResponse : [];
        setRecommendations(recommendations);
        setCachedRecommendations(recommendations);
      } catch (error) {
        console.error('Failed to fetch recommendations:', error)
        toast.error('Failed to load recommendations')
      } finally {
        setIsRecommendationsLoading(false)
      }
    }

    fetchDashboardData()
    fetchRecommendations()
  }, [])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Account Summary Card */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-72" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </div>
                <Skeleton className="h-4 w-64 mt-2" />
                <div className="flex items-center gap-4 mt-2">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Recent Activity Card */}
          <Card className="h-full bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]/50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4">
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Support Tickets Card */}
          <Card className="h-full bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="h-6 w-6" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              <div className="space-y-4 flex-1">
                {[1, 2, 3].map((index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]/50">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div>
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-5 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-4">
                <Skeleton className="h-9 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recommendations Card */}
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-64" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] bg-[var(--card)]/50">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-64" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-20" />
                </div>
              ))}
            </div>
            <div className="mt-4">
              <Skeleton className="h-9 w-full" />
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
      {/* Account Summary */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold">Welcome back, {accountDetails?.user.firstName}!</CardTitle>
              <CardDescription className="text-[var(--text-secondary)]">Here's what's happening with your account</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-[var(--accent)]/10">
                      <Bell className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Notifications</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link href="/dashboard/settings">
                      <Button variant="ghost" size="icon" className="rounded-full hover:bg-[var(--accent)]/10">
                        <Settings className="h-5 w-5" />
                      </Button>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              {accountDetails && (
                <ProfilePicture
                  user={{
                    ...accountDetails.user,
                    createdAt: new Date(accountDetails.user.createdAt),
                    updatedAt: new Date(accountDetails.user.updatedAt)
                  }}
                  size="lg"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xl font-semibold text-[var(--text-primary)]">
                    {accountDetails?.user.firstName} {accountDetails?.user.lastName}
                  </h4>
                  {accountDetails?.user.isEmailVerified && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Email verified</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
                <p className="text-sm text-[var(--text-tertiary)]">{accountDetails?.user.email}</p>
                <div className="flex items-center gap-4 mt-2">
                  <Badge
                    variant={accountDetails?.accountStatus.status === 'active' ? 'success' : 'warning'}
                    className="w-fit"
                  >
                    {accountDetails?.accountStatus.status === 'active' ? (
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                    ) : (
                      <AlertCircle className="w-4 h-4 mr-1" />
                    )}
                    {accountDetails?.accountStatus.status || 'Unknown'}
                  </Badge>
                  <span className="text-sm text-[var(--text-tertiary)] flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Last login: {accountDetails ? new Date(accountDetails.accountStatus.lastLogin).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
              <Link href="/dashboard/account">
                <Button variant="outline" className="gap-2 group">
                  View Profile
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Activity className="w-6 h-6 text-[var(--primary)]" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {accountDetails?.recentInteractions.length === 0 ? (
                <div className="text-center text-[var(--text-tertiary)] py-8">
                  <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  <AnimatePresence>
                    {accountDetails?.recentInteractions.slice(0, 3).map((interaction, index) => {
                      const Icon = getInteractionIcon(interaction.type);
                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50 hover:bg-[var(--card)]/80 group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                              <Icon className="w-5 h-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <h3 className="font-medium group-hover:text-[var(--primary)] transition-colors">{interaction.type}</h3>
                              <p className="text-sm text-[var(--text-tertiary)] line-clamp-1">{interaction.description}</p>
                            </div>
                          </div>
                          <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                            {new Date(interaction.timestamp).toLocaleDateString()}
                          </time>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
              <div className="mt-auto pt-4">
                <Link href="/dashboard/account">
                  <Button variant="outline" size="sm" className="w-full gap-2 group">
                    View All Activity
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Support Tickets */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-gradient-to-br from-[var(--card)] to-[var(--card)]/80 border-none shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Ticket className="w-6 h-6 text-[var(--primary)]" />
                Support Tickets
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-full">
              {supportTickets.length === 0 ? (
                <div className="text-center py-8">
                  <Ticket className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
                  <p className="text-[var(--text-tertiary)]">
                    You have no support tickets.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 flex-1">
                  <AnimatePresence>
                    {supportTickets.slice(0, 3).map((ticket, index) => (
                      <motion.div
                        key={ticket._id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50 hover:bg-[var(--card)]/80 group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                            <Ticket className="w-5 h-5 text-[var(--primary)]" />
                          </div>
                          <div>
                            <h3 className="font-medium group-hover:text-[var(--primary)] transition-colors">{ticket.subject}</h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge
                                variant={ticket.status === SupportTicketStatus.CLOSED ? 'success' : 'warning'}
                                className="text-xs"
                              >
                                {ticket.status === SupportTicketStatus.CLOSED ? (
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                ) : (
                                  <AlertCircle className="w-3 h-3 mr-1" />
                                )}
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <time className="text-xs text-[var(--text-tertiary)] whitespace-nowrap">
                          {new Date(ticket.createdAt).toLocaleDateString()}
                        </time>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              <div className="mt-auto pt-4">
                <Link href="/dashboard/support">
                  <Button variant="outline" size="sm" className="w-full gap-2 group">
                    View All Tickets
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recommendations */}
      {!isRecommendationsLoading && (
        <motion.div variants={itemVariants} className="space-y-4">
          {recommendations.length === 0 ? (
            <div className="text-center py-8">
              <Lightbulb className="w-12 h-12 text-[var(--text-tertiary)] mx-auto mb-4" />
              <p className="text-[var(--text-tertiary)]">
                No recommendations available at this time
              </p>
            </div>
          ) : (
            <AnimatePresence>
              {recommendations.slice(0, 3).map((rec, index) => (
                <motion.div
                  key={`${rec.type}-${index}`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 rounded-lg border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors bg-[var(--card)]/50 hover:bg-[var(--card)]/80 group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium group-hover:text-[var(--primary)] transition-colors">{rec.title}</h3>
                      <div>
                        <p className="text-sm text-[var(--text-secondary)]">
                          {rec.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}