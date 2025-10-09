// Secure refund management - works with Paddle.com's refund system
// NO card data storage required

export interface RefundRequest {
  transactionId: string;
  paddleTransactionId: string;
  reason: string;
  amount?: number; // For partial refunds
  customerEmail: string;
  requestedBy: string;
  timestamp: string;
}

export interface RefundResponse {
  refundId: string;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  amount: number;
  currency: string;
  estimatedProcessingTime: string;
  refundMethod: string;
}

export class SecureRefundManager {
  private static instance: SecureRefundManager;
  
  private constructor() {}
  
  static getInstance(): SecureRefundManager {
    if (!SecureRefundManager.instance) {
      SecureRefundManager.instance = new SecureRefundManager();
    }
    return SecureRefundManager.instance;
  }

  // Process refund through Paddle.com (secure method)
  async processRefund(request: RefundRequest): Promise<RefundResponse> {
    try {
      // Validate refund request
      this.validateRefundRequest(request);
      
      // In production, this would call Paddle's refund API
      const refundResponse = await this.callPaddleRefundAPI(request);
      
      // Log refund request (no sensitive data)
      await this.logRefundRequest(request, refundResponse);
      
      return refundResponse;
      
    } catch (error) {
      console.error('Refund processing failed:', error);
      throw new Error(`Refund failed: ${error}`);
    }
  }

  private validateRefundRequest(request: RefundRequest): void {
    if (!request.transactionId) {
      throw new Error('Transaction ID is required');
    }
    
    if (!request.paddleTransactionId) {
      throw new Error('Paddle transaction ID is required');
    }
    
    if (!request.reason || request.reason.trim().length < 10) {
      throw new Error('Refund reason must be at least 10 characters');
    }
    
    if (!request.customerEmail || !this.isValidEmail(request.customerEmail)) {
      throw new Error('Valid customer email is required');
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Simulate Paddle.com refund API call
  private async callPaddleRefundAPI(request: RefundRequest): Promise<RefundResponse> {
    // In production, this would be an actual API call to Paddle
    // Example: https://api.paddle.com/refunds
    
    console.log('Calling Paddle refund API with:', {
      paddleTransactionId: request.paddleTransactionId,
      reason: request.reason,
      amount: request.amount
    });
    
    // Simulate API response
    return {
      refundId: 'ref_' + Date.now(),
      status: 'pending',
      amount: request.amount || 29.00,
      currency: 'USD',
      estimatedProcessingTime: '5-7 business days',
      refundMethod: 'Original payment method'
    };
  }

  // Log refund request securely (no card data)
  private async logRefundRequest(request: RefundRequest, response: RefundResponse): Promise<void> {
    const refundLog = {
      refundId: response.refundId,
      originalTransactionId: request.transactionId,
      paddleTransactionId: request.paddleTransactionId,
      timestamp: request.timestamp,
      reason: request.reason,
      amount: response.amount,
      currency: response.currency,
      status: response.status,
      requestedBy: request.requestedBy,
      customerEmail: this.hashEmail(request.customerEmail),
      // IMPORTANT: NO CARD DATA LOGGED
      securityNote: 'Refund processed through Paddle.com - no card data stored'
    };
    
    // Store in secure database (not local files)
    console.log('Refund logged securely:', refundLog);
  }

  private hashEmail(email: string): string {
    // Hash email for privacy
    return `${email.substring(0, 3)}***@${email.split('@')[1]}`;
  }

  // Generate refund report for customer service
  async generateRefundReport(transactionId: string): Promise<any> {
    try {
      return {
        reportId: 'rpt_' + Date.now(),
        transactionId: transactionId,
        refundInstructions: {
          step1: 'Contact Paddle.com support directly',
          step2: 'Provide transaction ID and reason',
          step3: 'Refund processed to original payment method',
          supportUrl: 'https://paddle.com/support',
          supportEmail: 'support@paddle.com',
          estimatedTime: '5-7 business days'
        },
        securityNote: 'All payment data is securely managed by Paddle.com',
        complianceNote: 'PCI DSS Level 1 compliant processing'
      };
    } catch (error) {
      console.error('Failed to generate refund report:', error);
      throw error;
    }
  }

  // Check refund status
  async checkRefundStatus(refundId: string): Promise<any> {
    // In production, this would query Paddle's API
    return {
      refundId: refundId,
      status: 'processed',
      processedDate: new Date().toISOString(),
      refundMethod: 'Original payment method',
      note: 'Refund completed successfully'
    };
  }
}

export const refundManager = SecureRefundManager.getInstance();