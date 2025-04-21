// Generic API response type
export interface ApiResponse<T> {
  data: T
}

// Chatbot types
export interface ChatbotMessage {
  message: string
}

export interface ChatbotResponse {
  response: string
  sessionId: string
}

// Recommendation types
export interface Recommendation {
  type: string
  title: string
  description: string
  score: number
}

// Account types
// Define the enum for support ticket status
export enum SupportTicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

// Define the structure for a single support ticket based on the backend schema
export interface SupportTicket {
  _id: string;
  userId: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  resolutionDetails?: string;
  assignedTo?: string;
  createdAt: string; // Assuming timestamps are returned as strings
  updatedAt: string;
}

export interface AccountDetails {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    isEmailVerified: boolean;
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

// API response types
export interface ChatbotApiResponse extends ApiResponse<ChatbotResponse> {}
export interface RecommendationsApiResponse extends ApiResponse<Recommendation[]> {}
export interface AccountApiResponse extends ApiResponse<AccountDetails> {}