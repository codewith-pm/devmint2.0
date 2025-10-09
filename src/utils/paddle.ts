// Paddle.js v2 integration utility for production deployment
declare global {
  interface Window {
    Paddle: any;
  }
}

export interface PaddleCheckoutOptions {
  items: Array<{
    priceId: string;
    quantity?: number;
  }>;
  customData?: {
    userId?: string;
    planType?: string;
    billingCycle?: string;
    [key: string]: any;
  };
  customer?: {
    email?: string;
  };
  settings?: {
    displayMode?: 'inline' | 'overlay';
    theme?: 'light' | 'dark';
    locale?: string;
    allowLogout?: boolean;
    showAddTaxId?: boolean;
    showAddDiscounts?: boolean;
  };
}

export class PaddleService {
  private static instance: PaddleService;
  private isInitialized = false;
  private readonly clientToken = 'live_09f0758b28567d8bcbf3f62f734'; // Your live client token
  private readonly sellerId = '233505';
  private initializationPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): PaddleService {
    if (!PaddleService.instance) {
      PaddleService.instance = new PaddleService();
    }
    return PaddleService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    // Prevent multiple initialization attempts
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = new Promise((resolve, reject) => {
      try {
        // Remove existing Paddle script if any
        const existingScript = document.querySelector('script[src*="paddle"]');
        if (existingScript) {
          existingScript.remove();
        }

        // Load Paddle.js v2 script
        const script = document.createElement('script');
        script.src = 'https://cdn.paddle.com/paddle/v2/paddle.js';
        script.async = true;
        
        script.onload = () => {
          try {
            if (window.Paddle) {
              // Initialize Paddle v2 with correct parameters
              window.Paddle.Initialize({
                token: this.clientToken,
                eventCallback: this.handlePaddleEvent.bind(this)
              });
              
              this.isInitialized = true;
              resolve();
            } else {
              throw new Error('Paddle object not available after script load');
            }
          } catch (error) {
            this.isInitialized = false;
            reject(error);
          }
        };

        script.onerror = () => {
          reject(new Error('Failed to load Paddle script'));
        };

        document.head.appendChild(script);
      } catch (error) {
        reject(error);
      }
    });

    return this.initializationPromise;
  }

  private handlePaddleEvent(data: any) {
    try {
      switch (data.name) {
        case 'checkout.completed':
          this.handleCheckoutCompleted(data);
          break;
        case 'checkout.closed':
          this.handleCheckoutClosed(data);
          break;
        case 'checkout.error':
          this.handleCheckoutError(data);
          break;
        case 'checkout.loaded':
          // Checkout loaded successfully
          break;
        default:
          // Handle other events silently
          break;
      }
    } catch (error) {
      // Handle errors silently in production
    }
  }

  private handleCheckoutCompleted(data: any) {
    try {
      const transactionData = data.data;
      const customData = transactionData?.custom_data || {};
      const transactionId = transactionData?.transaction?.id || transactionData?.id;
      
      if (customData?.planType === 'donation') {
        this.showSuccessMessage(
          'Thank you for your donation!',
          'Your support helps us continue building amazing tools.',
          transactionId
        );
        
        setTimeout(() => {
          window.location.href = '/dashboard?payment=success&type=donation';
        }, 2000);
      } else {
        const planName = customData?.planType || 'Premium';
        const billingCycle = customData?.billingCycle || 'monthly';
        
        this.showSuccessMessage(
          'Subscription activated!',
          `Welcome to the ${planName} plan! You now have access to all premium features.`,
          transactionId
        );
        
        setTimeout(() => {
          window.location.href = '/dashboard?payment=success&plan=' + planName;
        }, 2000);
      }
    } catch (error) {
      // Fallback to dashboard on error
      setTimeout(() => {
        window.location.href = '/dashboard?payment=completed';
      }, 1000);
    }
  }

  private handleCheckoutClosed(data: any) {
    // User closed checkout without completing payment
    // Don't redirect automatically
  }

  private handleCheckoutError(data: any) {
    try {
      const errorMessage = data.error?.message || data.message || 'Payment processing failed.';
      
      this.showErrorMessage(
        'Payment Failed',
        errorMessage,
        'Please try again or contact support.'
      );
    } catch (error) {
      // Handle error silently
    }
  }

  private showSuccessMessage(title: string, message: string, transactionId?: string) {
    try {
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #10B981, #059669);
          color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
          z-index: 10000;
          max-width: 400px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${title}</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.4; opacity: 0.95;">${message}</p>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 4000);
    } catch (error) {
      // Handle error silently
    }
  }

  private showErrorMessage(title: string, message: string, suggestion: string) {
    try {
      const notification = document.createElement('div');
      notification.innerHTML = `
        <div style="
          position: fixed;
          top: 20px;
          right: 20px;
          background: linear-gradient(135deg, #EF4444, #DC2626);
          color: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(239, 68, 68, 0.3);
          z-index: 10000;
          max-width: 400px;
          font-family: system-ui, -apple-system, sans-serif;
        ">
          <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600;">${title}</h3>
          <p style="margin: 0; font-size: 14px; line-height: 1.4; opacity: 0.95;">${message} ${suggestion}</p>
        </div>
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 6000);
    } catch (error) {
      // Handle error silently
    }
  }

  async openCheckout(options: PaddleCheckoutOptions): Promise<void> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!window.Paddle || !window.Paddle.Checkout) {
        throw new Error('Payment system not available');
      }

      // Prepare checkout options for Paddle v2
      const checkoutOptions: any = {
        items: options.items.map(item => ({
          priceId: item.priceId,
          quantity: item.quantity || 1
        }))
      };

      // Add customer information if provided
      if (options.customer?.email) {
        checkoutOptions.customer = {
          email: options.customer.email
        };
      }

      // Add custom data if provided
      if (options.customData) {
        checkoutOptions.customData = {
          userId: 'user_' + Date.now(),
          timestamp: new Date().toISOString(),
          source: 'devmint_website',
          ...options.customData
        };
      }

      // Add settings with proper defaults
      checkoutOptions.settings = {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'en',
        allowLogout: false,
        showAddTaxId: true,
        showAddDiscounts: true,
        ...options.settings
      };

      // Open Paddle v2 checkout
      window.Paddle.Checkout.open(checkoutOptions);
      
    } catch (error) {
      throw new Error(`Failed to open checkout: ${error}`);
    }
  }

  // Create a donation checkout
  async createDonationCheckout(amount: number, description: string = 'Donation to Devmint'): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // Validate minimum amount
    if (amount < 1) {
      throw new Error('Minimum donation amount is $1.00');
    }

    try {
      // For donations, we'll use a simple checkout approach
      // In production, you'd have a specific donation product
      const donationPriceId = 'pri_01jxkfd08h8gwv7mqxw1ah948b'; // Using Pro monthly as base
      
      await this.openCheckout({
        items: [{
          priceId: donationPriceId,
          quantity: 1
        }],
        customData: {
          planType: 'donation',
          donationAmount: amount,
          description: description,
          isDonation: true
        },
        settings: {
          displayMode: 'overlay',
          theme: 'light',
          locale: 'en'
        }
      });

    } catch (error) {
      throw new Error(`Failed to process donation: ${error}`);
    }
  }

  // Check if Paddle is ready
  isReady(): boolean {
    return this.isInitialized && !!window.Paddle && !!window.Paddle.Checkout;
  }

  // Get Paddle status
  getStatus(): string {
    if (!this.isInitialized) return 'Not initialized';
    if (!window.Paddle) return 'Paddle not loaded';
    if (!window.Paddle.Checkout) return 'Checkout not available';
    return 'Ready';
  }

  // Get environment info (minimal for production)
  getEnvironmentInfo(): object {
    return {
      isInitialized: this.isInitialized,
      status: this.getStatus(),
      environment: 'production'
    };
  }

  // Force re-initialization
  async forceReinitialize(): Promise<void> {
    this.isInitialized = false;
    this.initializationPromise = null;
    
    // Remove existing script
    const existingScript = document.querySelector('script[src*="paddle"]');
    if (existingScript) {
      existingScript.remove();
    }
    
    // Clear window.Paddle
    if (window.Paddle) {
      delete window.Paddle;
    }
    
    await this.initialize();
  }

  // Test checkout functionality
  async testCheckout(): Promise<void> {
    if (!this.isReady()) {
      throw new Error('Payment system not ready');
    }

    // Test with Professional Plan Monthly
    const testOptions = {
      items: [{
        priceId: 'pri_01jxkfd08h8gwv7mqxw1ah948b',
        quantity: 1
      }],
      customData: {
        planType: 'pro',
        billingCycle: 'monthly',
        isTest: true
      },
      settings: {
        displayMode: 'overlay' as const,
        theme: 'light' as const
      }
    };

    await this.openCheckout(testOptions);
  }
}

export const paddle = PaddleService.getInstance();