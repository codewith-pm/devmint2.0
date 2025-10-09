// Secure payment logging utility - NEVER stores actual card data
// Only logs transaction metadata for business purposes

export interface TransactionMetadata {
  transactionId: string;
  timestamp: string;
  customerEmail: string;
  amount: number;
  currency: string;
  planType: string;
  billingCycle?: string;
  customerName?: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  paddleTransactionId?: string;
  refundReason?: string;
}

export class SecurePaymentLogger {
  private static instance: SecurePaymentLogger;
  
  private constructor() {}
  
  static getInstance(): SecurePaymentLogger {
    if (!SecurePaymentLogger.instance) {
      SecurePaymentLogger.instance = new SecurePaymentLogger();
    }
    return SecurePaymentLogger.instance;
  }

  // Log transaction metadata (NO CARD DATA)
  async logTransaction(metadata: TransactionMetadata): Promise<void> {
    try {
      // In a real application, this would go to a secure database
      // For demo purposes, we'll show the structure
      
      const logEntry = {
        id: metadata.transactionId,
        timestamp: metadata.timestamp,
        customer: {
          email: this.hashEmail(metadata.customerEmail),
          name: metadata.customerName ? this.hashName(metadata.customerName) : null
        },
        transaction: {
          amount: metadata.amount,
          currency: metadata.currency,
          planType: metadata.planType,
          billingCycle: metadata.billingCycle,
          status: metadata.status
        },
        paddle: {
          transactionId: metadata.paddleTransactionId
        },
        refund: {
          reason: metadata.refundReason || null
        },
        // IMPORTANT: NO CARD DATA IS EVER STORED
        security: {
          cardDataStored: false,
          pciCompliant: true,
          dataLocation: 'Paddle.com (PCI DSS Level 1)'
        }
      };

      // Store in secure database (not local files)
      await this.storeInSecureDatabase(logEntry);
      
      console.log('Transaction logged securely:', {
        transactionId: metadata.transactionId,
        amount: metadata.amount,
        status: metadata.status
      });
      
    } catch (error) {
      console.error('Failed to log transaction:', error);
    }
  }

  // Hash sensitive data for privacy
  private hashEmail(email: string): string {
    // In production, use proper hashing
    return `${email.substring(0, 3)}***@${email.split('@')[1]}`;
  }

  private hashName(name: string): string {
    // In production, use proper hashing
    return `${name.substring(0, 2)}***`;
  }

  // Store in secure database (NOT local files)
  private async storeInSecureDatabase(logEntry: any): Promise<void> {
    // This would connect to your secure database
    // Examples: PostgreSQL with encryption, MongoDB with field-level encryption
    
    // For demo purposes, we'll simulate the storage
    console.log('Storing in secure database:', {
      transactionId: logEntry.id,
      timestamp: logEntry.timestamp,
      securityNote: 'NO CARD DATA STORED - Handled by Paddle.com'
    });
  }

  // Generate transaction report for refunds (without card data)
  async generateRefundReport(transactionId: string): Promise<any> {
    try {
      // Retrieve transaction metadata from secure database
      const transaction = await this.getTransactionFromDatabase(transactionId);
      
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        refundReport: {
          transactionId: transaction.id,
          originalAmount: transaction.transaction.amount,
          currency: transaction.transaction.currency,
          customerEmail: transaction.customer.email,
          planType: transaction.transaction.planType,
          transactionDate: transaction.timestamp,
          paddleTransactionId: transaction.paddle.transactionId,
          refundInstructions: {
            method: 'Contact Paddle.com support',
            paddleSupport: 'https://paddle.com/support',
            note: 'Refunds are processed through Paddle.com as they are the Merchant of Record'
          },
          securityNote: 'Card details are securely stored by Paddle.com (PCI DSS Level 1 compliant)'
        }
      };
      
    } catch (error) {
      console.error('Failed to generate refund report:', error);
      throw error;
    }
  }

  private async getTransactionFromDatabase(transactionId: string): Promise<any> {
    // Simulate database retrieval
    // In production, this would query your secure database
    return {
      id: transactionId,
      timestamp: new Date().toISOString(),
      customer: { email: 'cus***@example.com' },
      transaction: { amount: 29.00, currency: 'USD', planType: 'pro' },
      paddle: { transactionId: 'paddle_' + transactionId }
    };
  }
}

export const paymentLogger = SecurePaymentLogger.getInstance();