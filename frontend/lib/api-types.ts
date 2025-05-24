import { UserRole } from '@/lib/types'

// Generic API response type
export interface ApiResponse<T> {
  data: T
}

// Customer Dashboard Types
export interface ChatbotMessage {
  message: string
}

export interface ChatbotResponse {
  response: string
  sessionId: string
  metadata?: {
    type: string
    section: string
  }
}

export interface Recommendation {
  id: string;
  type: string;
  title: string;
  description: string;
  score: number;
  priority: 'high' | 'medium' | 'low';
  action?: string;
  tags?: string[];
  category?: string;
  impact?: string;
  estimatedTime?: string;
}

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  CLOSED = 'CLOSED'
}

export enum SupportTicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export enum SupportTicketCategory {
  GENERAL = 'GENERAL',
  TECHNICAL = 'TECHNICAL',
  BILLING = 'BILLING',
  FEATURE = 'FEATURE'
}

export interface SupportTicket {
  _id: string;
  userId: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  category: SupportTicketCategory;
  resolutionDetails?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  attachments?: Array<{
    name: string;
    url: string;
  }>;
  replies?: Array<{
    author: string;
    message: string;
    timestamp: string;
    attachments?: Array<{
      name: string;
      url: string;
    }>;
  }>;
}

export enum InteractionType {
  CHAT = 'CHAT',
  EMAIL = 'EMAIL',
  SUPPORT_TICKET = 'SUPPORT_TICKET',
  SYSTEM = 'SYSTEM',
  LOGIN = 'LOGIN',
  SETTINGS_UPDATE = 'SETTINGS_UPDATE',
  PROFILE_UPDATE = 'PROFILE_UPDATE',
  DOCUMENT_VIEW = 'DOCUMENT_VIEW',
  FEATURE_USAGE = 'FEATURE_USAGE'
}

export interface AccountDetails {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: UserRole;
    isMfaEnabled: boolean;
    isEmailVerified: boolean;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    profilePicture?: string;
  };
  supportTickets: SupportTicket[];
  recentInteractions: Array<{
    type: InteractionType;
    description: string;
    timestamp: string;
    metadata?: Record<string, any>;
  }>;
  accountStatus: {
    status: string;
    lastLogin: string;
    subscriptionStatus: string;
  };
}

// Admin Dashboard Types
export interface AdminStats {
  totalUsers: number;
  systemHealth: number;
  activeConfigurations: number;
  systemLoad: number;
}

export interface SystemLog {
  _id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error';
}

export interface UserActivity {
  _id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

// Data Analyst Dashboard Types
export interface DataAnalystStats {
  dataPoints: number;
  analysisAccuracy: number;
  growthRate: number;
  predictionAccuracy: number;
}

export interface DataTrend {
  _id: string;
  metric: string;
  value: number;
  timestamp: string;
  change: number;
}

export interface Prediction {
  _id: string;
  metric: string;
  predictedValue: number;
  actualValue: number;
  confidence: number;
  timestamp: string;
}

// Marketing Specialist Dashboard Types
export interface MarketingStats {
  campaignReach: number;
  emailOpenRate: number;
  conversionRate: number;
  roi: number;
}

export interface Campaign {
  _id: string;
  name: string;
  status: 'active' | 'completed' | 'scheduled';
  reach: number;
  engagement: number;
  conversion: number;
  startDate: string;
  endDate: string;
}

export interface AudienceSegment {
  _id: string;
  name: string;
  size: number;
  engagement: number;
  conversion: number;
  lastUpdated: string;
}

// Sales Manager Dashboard Types
export interface SalesManagerStats {
  teamSize: number;
  teamPerformance: number;
  revenue: number;
  conversionRate: number;
}

export interface TeamMember {
  _id: string;
  name: string;
  role: string;
  performance: number;
  sales: number;
  lastActive: string;
}

export interface SalesPipeline {
  _id: string;
  stage: string;
  count: number;
  value: number;
  conversionRate: number;
  lastUpdated: string;
}

// Sales Rep Dashboard Types
export interface SalesRepStats {
  activeLeads: number;
  lastWeekLeads: number;
  conversionRate: number;
  lastMonthConversionRate: number;
}

export interface Lead {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  source: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation';
  company: string;
  jobTitle: string;
  notes: string;
  leadScore: number;
  interactions: any[];
  preferences: {
    preferredContactMethod: string;
    preferredContactTime: string;
    interests: string[];
    timeline: string;
    painPoints: string[];
    decisionMaker: boolean;
  };
  channelHistory: any[];
  demographics: {
    industry: string;
    companySize: string;
    location: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  _id: string;
  title: string;
  type: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

// API response types
export interface ChatbotApiResponse extends ApiResponse<ChatbotResponse> {}
export interface RecommendationsApiResponse extends ApiResponse<Recommendation[]> {}
export interface AccountApiResponse extends ApiResponse<AccountDetails> {}
export interface AdminStatsApiResponse extends ApiResponse<AdminStats> {}
export interface SystemLogsApiResponse extends ApiResponse<SystemLog[]> {}
export interface UserActivitiesApiResponse extends ApiResponse<UserActivity[]> {}
export interface DataAnalystStatsApiResponse extends ApiResponse<DataAnalystStats> {}
export interface DataTrendsApiResponse extends ApiResponse<DataTrend[]> {}
export interface PredictionsApiResponse extends ApiResponse<Prediction[]> {}
export interface MarketingStatsApiResponse extends ApiResponse<MarketingStats> {}
export interface CampaignsApiResponse extends ApiResponse<Campaign[]> {}
export interface AudienceSegmentsApiResponse extends ApiResponse<AudienceSegment[]> {}
export interface SalesManagerStatsApiResponse extends ApiResponse<SalesManagerStats> {}
export interface TeamMembersApiResponse extends ApiResponse<TeamMember[]> {}
export interface SalesPipelineApiResponse extends ApiResponse<SalesPipeline[]> {}
export interface SalesRepStatsApiResponse extends ApiResponse<SalesRepStats> {}
export interface LeadsApiResponse extends ApiResponse<Lead[]> {}
export interface TasksApiResponse extends ApiResponse<Task[]> {}

export enum LeadSource {
  WEBSITE = 'website',
  EMAIL = 'email',
  PHONE = 'phone',
  SOCIAL_MEDIA = 'social_media',
  REFERRAL = 'referral',
  LINKEDIN = 'linkedin',
  TRADE_SHOW = 'trade_show',
  OTHER = 'other',
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  PROPOSAL = 'proposal',
  NEGOTIATION = 'negotiation',
  CLOSED_WON = 'closed_won',
  CLOSED_LOST = 'closed_lost',
}

export enum PreferredContactMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  SMS = 'sms',
  WHATSAPP = 'whatsapp',
  LINKEDIN = 'linkedin',
}

// Performance Dashboard Types
export interface PerformanceMetric {
  title: string
  value: string
  change: number
}

export interface PerformanceLead {
  _id: string
  firstName: string
  lastName: string
  company: string
  jobTitle: string
  email: string
  phone: string
  status: string
  source: string
  leadScore: number
  notes: string
  interactions: any[]
  preferences: {
    preferredContactMethod: string
    preferredContactTime: string
    interests: string[]
    timeline: string
    painPoints: string[]
    decisionMaker: boolean
  }
  channelHistory: any[]
  demographics: {
    industry: string
    companySize: string
    location: string
  }
  lastContact: string
  createdAt: string
  updatedAt: string
}

export interface PerformanceData {
  metrics: PerformanceMetric[]
  topLeads: PerformanceLead[]
}

export interface PerformanceDataApiResponse extends ApiResponse<PerformanceData> {}

export interface Forecast {
  _id: string;
  metric: string;
  predictedValue: number;
  confidence: number;
  timestamp: string;
}

export interface Report {
  _id: string;
  name: string;
  type: string;
  format: string;
  generatedAt: string;
}