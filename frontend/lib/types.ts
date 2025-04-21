export enum UserRole {
  CUSTOMER = 'customer',
  SALES_REP = 'sales_rep',
  SALES_MANAGER = 'sales_manager',
  MARKETING_SPECIALIST = 'marketing_specialist',
  DATA_ANALYST = 'data_analyst',
  ADMIN = 'admin'
}

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  isMfaEnabled: boolean
  isEmailVerified: boolean
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}