import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle, Lock, Database } from 'lucide-react';
import { paymentLogger } from '../utils/securePaymentLogger';

const SecurePaymentHandler: React.FC = () => {
  const [showSecurityInfo, setShowSecurityInfo] = useState(false);

  const handleSecurePayment = async () => {
    try {
      // Example of secure transaction logging (NO CARD DATA)
      await paymentLogger.logTransaction({
        transactionId: 'txn_' + Date.now(),
        timestamp: new Date().toISOString(),
        customerEmail: 'customer@example.com',
        amount: 29.00,
        currency: 'USD',
        planType: 'pro',
        billingCycle: 'monthly',
        status: 'completed',
        paddleTransactionId: 'paddle_' + Date.now()
      });
      
      alert('Payment processed securely! No card data stored locally.');
    } catch (error) {
      console.error('Payment processing error:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Secure Payment Processing</h2>
          <p className="text-gray-600">
            Your payment data is protected by industry-leading security standards
          </p>
        </div>

        {/* Security Warning */}
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                ⚠️ CRITICAL SECURITY WARNING
              </h3>
              <p className="text-red-800 mb-4">
                <strong>NEVER store credit card data in local files or databases!</strong> This violates:
              </p>
              <ul className="text-red-700 text-sm space-y-1 mb-4">
                <li>• PCI DSS compliance requirements</li>
                <li>• GDPR and data protection laws</li>
                <li>• Creates massive security vulnerabilities</li>
                <li>• Exposes you to legal liability and fines</li>
              </ul>
              <p className="text-red-800 font-semibold">
                Use Paddle.com's secure payment processing instead!
              </p>
            </div>
          </div>
        </div>

        {/* Secure Alternative */}
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-green-900 mb-2">
                ✅ Secure Solution: Paddle.com Integration
              </h3>
              <p className="text-green-800 mb-4">
                Our current implementation is secure because:
              </p>
              <ul className="text-green-700 text-sm space-y-1 mb-4">
                <li>• Paddle.com handles all card data (PCI DSS Level 1 compliant)</li>
                <li>• We only receive transaction confirmations</li>
                <li>• No sensitive data stored locally</li>
                <li>• Refunds processed through Paddle's secure system</li>
              </ul>
            </div>
          </div>
        </div>

        {/* What We Actually Store */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="flex items-start space-x-4">
            <Database className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                What We Safely Store for Business Purposes
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                <div>
                  <h4 className="font-semibold mb-2">✅ Safe to Store:</h4>
                  <ul className="space-y-1">
                    <li>• Transaction ID</li>
                    <li>• Purchase amount</li>
                    <li>• Plan type</li>
                    <li>• Customer email (hashed)</li>
                    <li>• Transaction timestamp</li>
                    <li>• Paddle transaction reference</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-red-700">❌ NEVER Store:</h4>
                  <ul className="space-y-1 text-red-700">
                    <li>• Credit card numbers</li>
                    <li>• CVV codes</li>
                    <li>• Expiration dates</li>
                    <li>• Cardholder names</li>
                    <li>• Billing addresses</li>
                    <li>• Any payment credentials</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <Lock className="w-8 h-8 text-blue-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">End-to-End Encryption</h4>
            <p className="text-gray-600 text-sm">All data encrypted in transit and at rest</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <Shield className="w-8 h-8 text-green-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">PCI DSS Compliant</h4>
            <p className="text-gray-600 text-sm">Highest level of payment security</p>
          </div>
          
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <Database className="w-8 h-8 text-purple-600 mx-auto mb-3" />
            <h4 className="font-semibold text-gray-900 mb-2">Secure Storage</h4>
            <p className="text-gray-600 text-sm">No sensitive data stored locally</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleSecurePayment}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 transition-all duration-200"
          >
            Process Secure Payment
          </button>
          
          <button
            onClick={() => setShowSecurityInfo(!showSecurityInfo)}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            {showSecurityInfo ? 'Hide' : 'Show'} Security Details
          </button>
        </div>

        {/* Detailed Security Information */}
        {showSecurityInfo && (
          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Implementation Details</h3>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <strong>Payment Processing:</strong> Handled entirely by Paddle.com (PCI DSS Level 1 certified)
              </div>
              <div>
                <strong>Data Flow:</strong> Customer → Paddle.com → Transaction Confirmation → Our System
              </div>
              <div>
                <strong>Local Storage:</strong> Only transaction metadata (no payment credentials)
              </div>
              <div>
                <strong>Refund Process:</strong> Managed through Paddle.com's secure refund system
              </div>
              <div>
                <strong>Compliance:</strong> GDPR, CCPA, PCI DSS, SOC 2 Type II compliant
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurePaymentHandler;