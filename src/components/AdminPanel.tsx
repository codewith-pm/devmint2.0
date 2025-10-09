import { useState, useEffect } from 'react';
import { Shield, Trash2, AlertTriangle, Download, Calendar, Mail, MapPin, CreditCard, DollarSign } from 'lucide-react';
import { PaymentData } from '../types';
import { getPaymentData, deletePaymentData, clearAllPaymentData } from '../storage';

export default function AdminPanel() {
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = () => {
    const data = getPaymentData();
    setPayments(data);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this payment record?')) {
      deletePaymentData(id);
      loadPayments();
      if (selectedPayment?.id === id) {
        setSelectedPayment(null);
      }
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to delete ALL payment records? This cannot be undone.')) {
      clearAllPaymentData();
      loadPayments();
      setSelectedPayment(null);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(payments, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payment_data_export_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-red-500 mb-2">Security Warning</h3>
              <p className="text-red-300 text-sm leading-relaxed">
                This admin panel displays sensitive payment data stored insecurely. In real applications, this would be a major security violation.
                This is for educational purposes only to demonstrate the risks of improper data storage.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 rounded-2xl shadow-2xl border border-slate-700 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                  <Shield className="w-8 h-8" />
                  Admin Panel - Payment Data
                </h1>
                <p className="text-red-100 mt-2">
                  Total Records: {payments.length} | Educational Demo Only
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={exportData}
                  disabled={payments.length === 0}
                  className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
                <button
                  onClick={handleClearAll}
                  disabled={payments.length === 0}
                  className="bg-red-900/50 hover:bg-red-900/70 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </button>
              </div>
            </div>
          </div>

          <div className="p-6">
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No payment records found</p>
                <p className="text-slate-500 text-sm mt-2">Submit a payment through the form to see data here</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {payments.map((payment) => (
                    <div
                      key={payment.id}
                      onClick={() => setSelectedPayment(payment)}
                      className={`bg-slate-700/50 border-2 rounded-xl p-4 cursor-pointer transition ${
                        selectedPayment?.id === payment.id
                          ? 'border-blue-500 bg-slate-700'
                          : 'border-slate-600 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-lg">{payment.cardholderName}</h3>
                          <p className="text-slate-400 text-sm">{payment.transactionId}</p>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(payment.id);
                          }}
                          className="text-red-400 hover:text-red-300 transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-green-400 font-semibold">
                            {payment.amount} {payment.currency}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(payment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-700/30 border-2 border-slate-600 rounded-xl p-6">
                  {selectedPayment ? (
                    <div className="space-y-6">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-4">Payment Details</h2>
                      </div>

                      <div className="space-y-4">
                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Transaction ID</label>
                          <p className="text-white font-mono">{selectedPayment.transactionId}</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-2">
                            <DollarSign className="w-3 h-3" />
                            Amount
                          </label>
                          <p className="text-white text-2xl font-bold">
                            {selectedPayment.amount} {selectedPayment.currency}
                          </p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Cardholder Name</label>
                          <p className="text-white">{selectedPayment.cardholderName}</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-2">
                            <CreditCard className="w-3 h-3" />
                            Card Number
                          </label>
                          <p className="text-white font-mono">{selectedPayment.cardNumber}</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Expiry Month</label>
                            <p className="text-white">{selectedPayment.expiryMonth}</p>
                          </div>
                          <div className="bg-slate-800/50 rounded-lg p-4">
                            <label className="block text-xs font-semibold text-slate-400 mb-1">Expiry Year</label>
                            <p className="text-white">{selectedPayment.expiryYear}</p>
                          </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">CVV</label>
                          <p className="text-white font-mono">{selectedPayment.cvv}</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            Email
                          </label>
                          <p className="text-white">{selectedPayment.email}</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-2">
                            <MapPin className="w-3 h-3" />
                            Billing Address
                          </label>
                          <p className="text-white">{selectedPayment.billingAddress}</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1">ZIP Code</label>
                          <p className="text-white">{selectedPayment.zipCode}</p>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4">
                          <label className="block text-xs font-semibold text-slate-400 mb-1 flex items-center gap-2">
                            <Calendar className="w-3 h-3" />
                            Created At
                          </label>
                          <p className="text-white">{new Date(selectedPayment.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-400">Select a payment record to view details</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
