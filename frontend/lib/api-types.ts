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
}

export interface Recommendation {
  type: string
  title: string
  description: string
  score: number
}

export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export interface SupportTicket {
  _id: string;
  userId: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  resolutionDetails?: string;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
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
  };
  supportTickets: SupportTicket[];
  recentInteractions: Array<{
    type: string;
    description: string;
    timestamp: string;
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
  tasks: number;
  conversionRate: number;
}

export interface Lead {
  _id: string;
  name: string;
  company: string;
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation';
  value: number;
  lastContact: string;
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