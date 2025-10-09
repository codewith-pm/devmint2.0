import { useState } from 'react';
import { CreditCard, Mail, MapPin, DollarSign, AlertTriangle } from 'lucide-react';
import { PaymentData, CurrencyRate } from '../types';
import { savePaymentData } from '../storage';

const currencyRates: CurrencyRate[] = [
  { code: 'USD', name: 'US Dollar', rate: 1 },
  { code: 'EUR', name: 'Euro', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', rate: 149.50 },
  { code: 'INR', name: 'Indian Rupee', rate: 83.12 },
  { code: 'CAD', name: 'Canadian Dollar', rate: 1.36 },
  { code: 'AUD', name: 'Australian Dollar', rate: 1.52 },
];

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: '',
    billingAddress: '',
    zipCode: '',
    email: '',
    amount: '',
    currency: 'USD',
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const paymentData: PaymentData = {
      id: crypto.randomUUID(),
      cardholderName: formData.cardholderName,
      cardNumber: formData.cardNumber,
      expiryMonth: formData.expiryMonth,
      expiryYear: formData.expiryYear,
      cvv: formData.cvv,
      billingAddress: formData.billingAddress,
      zipCode: formData.zipCode,
      email: formData.email,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      transactionId: `TXN_${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    savePaymentData(paymentData);

    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);

    setFormData({
      cardholderName: '',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvv: '',
      billingAddress: '',
      zipCode: '',
      email: '',
      amount: '',
      currency: 'USD',
    });
  };

  const convertedAmount = formData.amount
    ? (parseFloat(formData.amount) * (currencyRates.find(r => r.code === formData.currency)?.rate || 1)).toFixed(2)
    : '0.00';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {showWarning && (
          <div className="mb-8 bg-red-500/10 border-2 border-red-500 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-xl font-bold text-red-500 mb-2">Educational Demo Only</h3>
                <p className="text-red-300 text-sm leading-relaxed mb-3">
                  This is a demonstration for educational purposes to show why storing payment data is dangerous.
                  NEVER store credit card data in real applications. Always use PCI DSS compliant payment processors like Stripe or PayPal.
                </p>
                <button
                  onClick={() => setShowWarning(false)}
                  className="text-sm text-red-400 hover:text-red-300 underline"
                >
                  I understand, continue to demo
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <CreditCard className="w-8 h-8" />
              Payment Form Demo
            </h1>
            <p className="text-blue-100 mt-2">Educational awareness project - Not for real transactions</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
              >
                {currencyRates.map((currency) => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name}
                  </option>
                ))}
              </select>
              {formData.amount && formData.currency !== 'USD' && (
                <p className="mt-2 text-sm text-slate-400">
                  ≈ ${convertedAmount} USD (using rate: {currencyRates.find(r => r.code === formData.currency)?.rate})
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Cardholder Name
              </label>
              <input
                type="text"
                required
                value={formData.cardholderName}
                onChange={(e) => setFormData({ ...formData, cardholderName: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                Card Number
              </label>
              <input
                type="text"
                required
                maxLength={19}
                value={formData.cardNumber}
                onChange={(e) => {
                  const value = e.target.value.replace(/\s/g, '');
                  const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
                  setFormData({ ...formData, cardNumber: formatted });
                }}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="1234 5678 9012 3456"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Month
                </label>
                <select
                  required
                  value={formData.expiryMonth}
                  onChange={(e) => setFormData({ ...formData, expiryMonth: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => {
                    const month = (i + 1).toString().padStart(2, '0');
                    return (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Year
                </label>
                <select
                  required
                  value={formData.expiryYear}
                  onChange={(e) => setFormData({ ...formData, expiryYear: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500 transition"
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => {
                    const year = (new Date().getFullYear() % 100 + i).toString().padStart(2, '0');
                    return (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  CVV
                </label>
                <input
                  type="text"
                  required
                  maxLength={4}
                  value={formData.cvv}
                  onChange={(e) => setFormData({ ...formData, cvv: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                  placeholder="123"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="john@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Billing Address
              </label>
              <input
                type="text"
                required
                value={formData.billingAddress}
                onChange={(e) => setFormData({ ...formData, billingAddress: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="123 Main St, City, State"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-300 mb-2">
                ZIP / Postal Code
              </label>
              <input
                type="text"
                required
                value={formData.zipCode}
                onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                className="w-full px-4 py-3 bg-slate-700 border-2 border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
                placeholder="12345"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
            >
              Submit Payment (Demo)
            </button>
          </form>
        </div>

        {showSuccess && (
          <div className="mt-6 bg-green-500/10 border-2 border-green-500 rounded-xl p-6">
            <p className="text-green-400 font-semibold">
              Payment data saved! View it in the admin panel.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
