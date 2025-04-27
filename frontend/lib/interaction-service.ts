import { api } from './api-client';
import { InteractionType } from './api-types';

class InteractionService {
  private static instance: InteractionService;

  private constructor() {}

  public static getInstance(): InteractionService {
    if (!InteractionService.instance) {
      InteractionService.instance = new InteractionService();
    }
    return InteractionService.instance;
  }

  async trackInteraction(
    type: InteractionType,
    description: string,
    metadata: Record<string, any> = {}
  ) {
    try {
      await api.post('/api/customer/interaction', {
        type,
        description,
        metadata,
      });
    } catch (error) {
      console.error('Failed to track interaction:', error);
    }
  }

  // Login tracking
  async trackLogin(email: string) {
    await this.trackInteraction(
      InteractionType.LOGIN,
      `User logged in: ${email}`,
      { email }
    );
  }

  // Settings update tracking
  async trackSettingsUpdate(settings: Record<string, any>) {
    await this.trackInteraction(
      InteractionType.SETTINGS_UPDATE,
      'User updated settings',
      { settings }
    );
  }

  // Profile update tracking
  async trackProfileUpdate(changes: Record<string, any>) {
    await this.trackInteraction(
      InteractionType.PROFILE_UPDATE,
      'User updated profile',
      { changes }
    );
  }

  // Document view tracking
  async trackDocumentView(documentId: string, documentType: string) {
    await this.trackInteraction(
      InteractionType.DOCUMENT_VIEW,
      `User viewed ${documentType}`,
      { documentId, documentType }
    );
  }

  // Feature usage tracking
  async trackFeatureUsage(featureName: string, details: Record<string, any> = {}) {
    await this.trackInteraction(
      InteractionType.FEATURE_USAGE,
      `User used feature: ${featureName}`,
      { featureName, ...details }
    );
  }

  // System event tracking
  async trackSystemEvent(event: string, details: Record<string, any> = {}) {
    await this.trackInteraction(
      InteractionType.SYSTEM,
      `System event: ${event}`,
      { event, ...details }
    );
  }

  // Chat interaction tracking
  async trackChat(message: string, sessionId: string, metadata: Record<string, any> = {}) {
    await this.trackInteraction(
      InteractionType.CHAT,
      `Chat message: ${message.substring(0, 50)}${message.length > 50 ? '...' : ''}`,
      { message, sessionId, ...metadata }
    );
  }

  // Email interaction tracking
  async trackEmail(subject: string, recipient: string, metadata: Record<string, any> = {}) {
    await this.trackInteraction(
      InteractionType.EMAIL,
      `Email sent: ${subject}`,
      { subject, recipient, ...metadata }
    );
  }

  // Support ticket tracking
  async trackSupportTicket(
    ticketId: string,
    action: 'created' | 'updated' | 'closed',
    details: Record<string, any> = {}
  ) {
    await this.trackInteraction(
      InteractionType.SUPPORT_TICKET,
      `Support ticket ${action}: ${ticketId}`,
      { ticketId, action, ...details }
    );
  }

  // Logout tracking
  async trackLogout(email: string) {
    await this.trackInteraction(
      InteractionType.SYSTEM,
      `User logged out: ${email}`,
      { email }
    );
  }

  // Password change tracking
  async trackPasswordChange(email: string) {
    await this.trackInteraction(
      InteractionType.SYSTEM,
      `Password changed for user: ${email}`,
      { email }
    );
  }

  // MFA status change tracking
  async trackMfaStatusChange(email: string, enabled: boolean) {
    await this.trackInteraction(
      InteractionType.SYSTEM,
      `MFA ${enabled ? 'enabled' : 'disabled'} for user: ${email}`,
      { email, enabled }
    );
  }

  // Email verification tracking
  async trackEmailVerification(email: string, verified: boolean) {
    await this.trackInteraction(
      InteractionType.SYSTEM,
      `Email ${verified ? 'verified' : 'unverified'} for user: ${email}`,
      { email, verified }
    );
  }

  // Account status change tracking
  async trackAccountStatusChange(email: string, status: string) {
    await this.trackInteraction(
      InteractionType.SYSTEM,
      `Account status changed to ${status} for user: ${email}`,
      { email, status }
    );
  }
}

export const interactionService = InteractionService.getInstance();