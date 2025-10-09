import React, { useState } from 'react';
import { CreditCard, Lock, Shield, Eye, EyeOff, Folder, FileText, Download, DollarSign } from 'lucide-react'; // Added DollarSign
import { fileStorage, PaymentFileData } from '../utils/fileStorage'; // Use the interface from fileStorage

// The interface PaymentData is now in fileStorage.ts as PaymentFileData
// interface PaymentData { ... } // Removed

// The prop is no longer needed but kept for completeness if needed elsewhere
interface PaymentPageProps {
  onPaymentComplete: () => void;
}

// Simple Currency Converter Component (New Requirement)
const CurrencyConverter: React.FC = () => {
  const [usdAmount, setUsdAmount] = useState(100);
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  
  // Static dummy rates for educational purposes (not real-time)
  const rates: Record<string, number> = {
    EUR: 0.92, // 1 USD = 0.92 EUR
    GBP: 0.80, // 1 USD = 0.80 GBP
    JPY: 155.00, // 1 USD = 155.00 JPY
    INR: 83.50, // 1 USD = 83.50 INR
  };

  const convertedAmount = usdAmount * (rates[targetCurrency] || 1);

  return (
    <div className="bg-gray-800 text-white p-6 rounded-xl shadow-lg mt-8">
      <h3 className="text-lg font-semibold mb-3 flex items-center">
        <DollarSign className="w-5 h-5 mr-2 text-yellow-400" /> Currency Converter (Demo)
      </h3>
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Amount (USD)</label>
          <input
            type="number"
            value={usdAmount}
            onChange={(e) => setUsdAmount(parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
            min="0"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Convert To</label>
          <select
            value={targetCurrency}
            onChange={(e) => setTargetCurrency(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-gray-700 border-gray-600 text-white focus:ring-blue-500"
          >
            {Object.keys(rates).map(currency => (
              <option key={currency} value={currency}>{currency}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Result</label>
          <p className="text-xl font-bold text-green-400 mt-1">
            {convertedAmount.toFixed(2)} {targetCurrency}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">Rate: {rates[targetCurrency] || 1}</p>
        </div>
      </div>
    </div>
  );
};

const PaymentPage: React.FC<PaymentPageProps> = ({ onPaymentComplete }) => {
  // formData type now implicitly matches PaymentFileData from fileStorage.ts
  const [formData, setFormData] = useState<PaymentFileData>({
    fullName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    zipCode: '',
    cardType: 'credit',
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
    
    // Format card number with spaces
    if (name === 'cardNumber') {
      const formattedValue = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
      setFormData(prev => ({ ...prev, [name]: formattedValue }));
    } else {
      // Use type assertion here for name to correctly update state
      setFormData(prev => ({ ...prev, [name as keyof PaymentFileData]: value as any }));
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

  const createPaymentFile = async () => {
    // No need for a secondary check as validation runs in handleSubmit
    setIsProcessing(true);

    const filename = await fileStorage.createDangerousPaymentFile(formData);
    setCreatedFiles(prev => [...prev, filename]);
    
    setIsProcessing(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);

    // --- OLD LOCAL STORAGE LOGIC REMOVED ---
    // const paymentData: PaymentData = { ...formData, timestamp: new Date().toISOString() };
    // const existingData = localStorage.getItem('demo_payment_data');
    // const allData = existingData ? JSON.parse(existingData) : [];
    // allData.push(paymentData);
    // localStorage.setItem('demo_payment_data', JSON.stringify(allData));
    // ----------------------------------------

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setIsLoading(false);
   
    // Create the dangerous file with collected data
    await createPaymentFile();

    // Redirect after success message
    setTimeout(() => {
      setShowSuccess(true);
      window.location.href = "/pricing"; // Redirect to Pricing page
    }, 100); // Reduced timeout for file creation success

  };

  const getCardIcon = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return '💳 Visa';
    if (number.startsWith('5')) return '💳 Mastercard';
    if (number.startsWith('3')) return '💳 Amex';
    return '💳 Card';
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

// File management utilities are no longer needed here as the AdminPage handles viewing/deletion
// const viewFile = (filename: string) => { ... }
// const deleteFile = (filename: string) => { ... }
// React.useEffect(() => { setCreatedFiles(fileStorage.getDatasFolderContents()); }, []); // Removed

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header (Unchanged) */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure Payment</h1>
          <p className="text-gray-600">Enter your payment information below</p>
        </div>

        {/* Payment Form (Unchanged Design) */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Security Badge (Unchanged) */}
          <div className="flex items-center justify-center mb-6 p-3 bg-green-50 rounded-lg">
            <Lock className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-green-700 font-medium">SSL Secured & Encrypted</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Card Type Selection (Unchanged) */}
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

            {/* Full Name (Unchanged) */}
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

            {/* Card Number (Unchanged) */}
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

            {/* Expiry and CVV (Unchanged) */}
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

            {/* ZIP Code (Unchanged) */}
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

            {/* Submit Button (Unchanged Design) */}
            <button
            
              type="submit"
              disabled={isLoading || isProcessing}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-blue-800 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading || isProcessing ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                  {isProcessing ? 'Saving Dangerous File...' : 'Verifying Payment...'}
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Lock className="w-5 h-5 mr-2" />
                  Verify Payment
                </div>
              )}
            </button>
          </form>

          {/* New Currency Converter Added Here */}
          <CurrencyConverter />

          {/* Security Footer (Unchanged) */}
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
