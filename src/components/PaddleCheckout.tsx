import React, { useState, useEffect } from 'react';
import { paddle } from '../utils/paddle';
import { CreditCard, Loader, DollarSign, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface PaddleCheckoutProps {
  planType: 'pro' | 'enterprise' | 'donation';
  billingCycle?: 'monthly' | 'yearly';
  userEmail?: string;
  customAmount?: number;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

const PaddleCheckout: React.FC<PaddleCheckoutProps> = ({
  planType,
  billingCycle = 'monthly',
  userEmail,
  customAmount,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const [paddleStatus, setPaddleStatus] = useState<string>('Initializing...');

  // Your actual Paddle product price IDs
  const priceIds = {
    pro: {
      monthly: 'pri_01jxkfd08h8gwv7mqxw1ah948b', // Professional Monthly $29
      yearly: 'pri_01jxkfsmdcw6tfx7s0wjkdbazr'   // Professional Yearly $288
    },
    enterprise: {
      monthly: 'pri_01jxkfk7whgk1q9pjfxdt4kbg6', // Enterprise Monthly $99
      yearly: 'pri_01jxkfxs04a3gxkrwj32kpzk30'   // Enterprise Yearly $984
    },
    donation: {
      productId: 'pro_01jxj37mv7xyy7kmkewmta6dze'
    },
    // Special plans
    trial3days: {
      priceId: 'pri_01jygjtk2bhbj8sh2e7madbdww' // 3-Day Trial $10
    },
    specialPlan: {
      priceId: 'pri_01jybaqsq78zzqckkfea2dnd3m' // Special Plan $530/month
    },
    customisePlan: {
      priceId: 'pri_01jxwcvwjpphsjs28t932a5d02' // Customise Plan $200/month
    },
    trialVersion: {
      priceId: 'pri_01jxwcsbe2dmntwa2k0h37p66w' // Trial Version $50
    }
  };

  useEffect(() => {
    initializePaddle();
  }, []);

  const initializePaddle = async () => {
    try {
      setIsLoading(true);
      setPaddleStatus('Loading payment system...');
      setInitError(null);
      
      await paddle.initialize();
      
      setIsInitialized(true);
      setPaddleStatus('Ready for payment');
      
    } catch (error) {
      setInitError(`Failed to initialize payment system: ${error}`);
      setPaddleStatus('Failed to load');
      onError?.('Failed to initialize payment system. Please refresh the page and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryInitialization = async () => {
    setInitError(null);
    setIsInitialized(false);
    
    try {
      setIsLoading(true);
      setPaddleStatus('Retrying initialization...');
      await paddle.forceReinitialize();
      setIsInitialized(true);
      setPaddleStatus('Ready for payment');
    } catch (error) {
      setInitError(`Retry failed: ${error}`);
      setPaddleStatus('Failed to load');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    if (!isInitialized) {
      onError?.('Payment system not ready. Please refresh the page and try again.');
      return;
    }

    if (!paddle.isReady()) {
      onError?.('Payment system is not ready. Please try again in a moment.');
      return;
    }

    setIsLoading(true);
    setPaddleStatus('Opening checkout...');

    try {
      if (planType === 'donation' && customAmount) {
        console.log('Creating donation checkout for amount:', customAmount);
        await paddle.createDonationCheckout(customAmount, 'Donation to Devmint');
        setPaddleStatus('Donation checkout opened');
      } else {
        const priceId = priceIds[planType][billingCycle];
        if (!priceId) {
          // Check if it's a special plan with direct price ID
          const specialPlanPriceId = priceIds[planType]?.priceId;
          if (!specialPlanPriceId) {
            throw new Error(`Invalid plan configuration: ${planType} ${billingCycle}`);
          }
          
          console.log('Creating special plan checkout:', planType);
          await paddle.openCheckout({
            items: [{ priceId: specialPlanPriceId, quantity: 1 }],
            customer: userEmail ? { email: userEmail } : undefined,
            customData: {
              planType,
              billingCycle: 'monthly',
              userId: userEmail || 'anonymous',
              timestamp: new Date().toISOString(),
              source: 'devmint_website',
              isSpecialPlan: true
            },
            settings: {
              displayMode: 'overlay',
              theme: 'light',
              locale: 'en',
              allowLogout: false,
              showAddTaxId: true,
              showAddDiscounts: true
            }
          });
          return;
        }

        console.log('Creating subscription checkout for plan:', planType, 'billing:', billingCycle);
        await paddle.openCheckout({
          items: [{ priceId, quantity: 1 }],
          customer: userEmail ? { email: userEmail } : undefined,
          customData: {
            planType,
            billingCycle,
            userId: userEmail || 'anonymous',
            timestamp: new Date().toISOString(),
            source: 'devmint_website'
          },
          settings: {
            displayMode: 'overlay',
            theme: 'light',
            locale: 'en',
            allowLogout: false,
            showAddTaxId: true,
            showAddDiscounts: true
          }
        });
      }
      
      setPaddleStatus('Checkout opened successfully');
      onSuccess?.();
      
    } catch (error) {
      console.error('Checkout error:', error);
      setPaddleStatus('Checkout failed');
      onError?.(`Failed to start checkout: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getPlanDetails = () => {
    switch (planType) {
      case 'pro':
        return {
          name: 'Professional Plan',
          price: billingCycle === 'monthly' ? '$29/month' : '$24/month',
          originalPrice: billingCycle === 'yearly' ? '$29/month' : undefined,
          savings: billingCycle === 'yearly' ? '$60/year (billed $288/year)' : undefined,
          description: '50,000 API calls, premium templates, priority support',
          features: [
            '50,000 API calls per month',
            '25+ premium invoice templates',
            'Priority email support',
            'Advanced analytics dashboard',
            'Custom branding options',
            'Team collaboration (5 seats)',
            'Webhook notifications',
            'API rate limit increases'
          ]
        };
      case 'enterprise':
        return {
          name: 'Enterprise Plan',
          price: billingCycle === 'monthly' ? '$99/month' : '$82/month',
          originalPrice: billingCycle === 'yearly' ? '$99/month' : undefined,
          savings: billingCycle === 'yearly' ? '$204/year (billed $984/year)' : undefined,
          description: 'Unlimited API calls, custom templates, 24/7 support',
          features: [
            'Unlimited API calls',
            'All premium templates + custom design',
            '24/7 phone & email support',
            'Dedicated account manager',
            'White-label solution',
            'Unlimited team members',
            '99.9% SLA guarantee',
            'Custom integrations support'
          ]
        };
      case 'trial3days':
        return {
          name: '3-Day Trial',
          price: '$10',
          description: 'Quick trial to test our premium features',
          features: [
            'Full access to Professional features',
            '50,000 API calls for 3 days',
            'All premium templates',
            'Priority support during trial',
            'No long-term commitment'
          ]
        };
      case 'trialVersion':
        return {
          name: 'Trial Version',
          price: '$50',
          description: 'Extended trial with more features',
          features: [
            '30-day extended trial period',
            '100,000 API calls',
            'All premium templates',
            'Priority email support',
            'Advanced analytics access'
          ]
        };
      case 'customisePlan':
        return {
          name: 'Customise Plan',
          price: '$200/month',
          description: 'Tailored solution for specific needs',
          features: [
            'Custom API call limits',
            'Personalized templates',
            'Dedicated support channel',
            'Custom integrations',
            'Flexible billing terms'
          ]
        };
      case 'specialPlan':
        return {
          name: 'Special Plan',
          price: '$530/month',
          description: 'Premium solution for high-volume enterprises',
          features: [
            'Unlimited API calls',
            'White-label solution',
            '24/7 dedicated support',
            'Custom infrastructure',
            'SLA guarantees'
          ]
        };
      case 'donation':
        return {
          name: 'Support Devmint',
          price: customAmount ? `$${customAmount.toFixed(2)}` : 'Custom amount',
          description: 'Help us continue building amazing API tools',
          features: [
            'Support ongoing development',
            'Help maintain 99.9% uptime',
            'Enable new feature development',
            'Keep free tier available',
            'Improve documentation & support',
            'Support open-source initiatives'
          ]
        };
      default:
        return { name: '', price: '', description: '', features: [] };
    }
  };

  const planDetails = getPlanDetails();

  if (initError) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Payment System Error</h3>
          <p className="text-red-600 mb-4 text-sm">{initError}</p>
          <div className="space-y-3">
            <button
              onClick={handleRetryInitialization}
              disabled={isLoading}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors flex items-center mx-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Retrying...' : 'Retry Initialization'}
            </button>
            <div className="text-xs text-gray-500">
              If the problem persists, please contact{' '}
              <a href="mailto:support@devmint.site" className="text-blue-600 hover:underline">
                support@devmint.site
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          {planType === 'donation' ? (
            <DollarSign className="w-8 h-8 text-white" />
          ) : (
            <CreditCard className="w-8 h-8 text-white" />
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">{planDetails.name}</h3>
        <div className="text-3xl font-bold text-blue-600 mb-2">
          {planDetails.price}
          {planDetails.originalPrice && (
            <div className="text-lg text-gray-500 line-through">{planDetails.originalPrice}</div>
          )}
        </div>
        {planDetails.savings && (
          <div className="text-green-600 font-semibold mb-2">Save {planDetails.savings}</div>
        )}
        <p className="text-gray-600">{planDetails.description}</p>
        
        {billingCycle === 'yearly' && planType !== 'donation' && (
          <div className="mt-3 inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Best Value - Save {planDetails.savings}
          </div>
        )}
      </div>

      {/* Features List */}
      {planDetails.features && planDetails.features.length > 0 && (
        <div className="mb-6">
          <h4 className="font-semibold text-gray-900 mb-3">What's included:</h4>
          <ul className="space-y-2">
            {planDetails.features.map((feature, index) => (
              <li key={index} className="flex items-center text-sm text-gray-700">
                <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                {feature}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Status Display */}
      <div className="mb-4 p-3 bg-gray-50 rounded-xl">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Payment System Status:</span>
          <span className={`font-medium ${
            isInitialized ? 'text-green-600' : isLoading ? 'text-blue-600' : 'text-red-600'
          }`}>
            {paddleStatus}
          </span>
        </div>
      </div>

      {/* Live Credentials Info */}
      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
        <div className="flex items-start space-x-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-800">
            <strong>Live Payment Processing:</strong> This checkout uses secure credentials.
            <div className="mt-2 text-xs space-y-1">
              <div>Real payments will be processed</div>
              <div>Secure SSL encryption</div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        {/* Main Payment Button */}
        <button
          onClick={handleCheckout}
          disabled={isLoading || !isInitialized}
          className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 mr-2 animate-spin" />
              {paddleStatus}
            </>
          ) : !isInitialized ? (
            'Loading Payment System...'
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              {planType === 'donation' 
                ? `Donate $${customAmount?.toFixed(2) || '0.00'}` 
                : planType.includes('trial') || planType.includes('Plan')
                  ? `Get ${planDetails.name}`
                  : `Subscribe ${billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}`
              }
            </>
          )}
        </button>
      </div>

      {/* Payment Info */}
      <div className="mt-4 text-center">
        <div className="text-xs text-gray-500 mb-2">
          Secure payment processing by{' '}
          <a href="https://paddle.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
            Paddle.com
          </a>
        </div>
        
        <div className="text-xs text-gray-500 mb-2">
          Accepts: Visa, Mastercard, Amex, PayPal, Apple Pay, Google Pay
        </div>
        
        {planType !== 'donation' && (
          <div className="text-xs text-gray-500">
            Cancel anytime • 30-day money-back guarantee
          </div>
        )}
        
        {planType === 'donation' && (
          <div className="text-xs text-gray-500">
            Thank you for supporting open-source development
          </div>
        )}
      </div>
    </div>
  );
};

export default PaddleCheckout;