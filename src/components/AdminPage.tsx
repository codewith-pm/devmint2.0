import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, Eye, EyeOff, AlertTriangle, Users } from 'lucide-react';

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

const AdminPage: React.FC = () => {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentData | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    const storedData = localStorage.getItem('demo_payment_data');
    if (storedData) {
      const data = JSON.parse(storedData);
      setPaymentData(data);
    }
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all collected demo data?')) {
      localStorage.removeItem('demo_payment_data');
      setPaymentData([]);
      setSelectedRecord(null);
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(paymentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `payment_demo_data_${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const maskCardNumber = (cardNumber: string) => {
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '••••-••••-••••-$4');
  };

  const getCardType = (cardNumber: string) => {
    const number = cardNumber.replace(/\s/g, '');
    if (number.startsWith('4')) return 'Visa';
    if (number.startsWith('5')) return 'Mastercard';
    if (number.startsWith('3')) return 'American Express';
    return 'Unknown';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Database className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🔐 Admin
                </h1>
                <p className="text-gray-600">
                  Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-gray-500" />
              <span className="text-lg font-semibold text-gray-700">
                {paymentData.length} Records
              </span>
            </div>
          </div>
        </div>

        {/* Warning Banner */}
        {/* <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-red-800 mb-1">Educational Purpose Only</h3>
              <p className="text-red-700 text-sm">
                This data collection demonstrates how malicious websites capture sensitive information. 
                In real attacks, this data would be used for identity theft and financial fraud.
              </p>
            </div>
          </div>
        </div> */}

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCardNumbers(!showCardNumbers)}
                className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                {showCardNumbers ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                {showCardNumbers ? 'Hide' : 'Show'} Card Numbers
              </button>
              
              <button
                onClick={exportData}
                disabled={paymentData.length === 0}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>

            <button
              onClick={clearAllData}
              disabled={paymentData.length === 0}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {paymentData.length === 0 ? (
            <div className="p-12 text-center">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No Data Collected Yet</h3>
              <p className="text-gray-400">
                Payment information will appear here when users complete the demo form
              </p>
              <a
                href="/"
                className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                onClick={() => window.location.hash = ''}
              >
                Go to Payment Demo
              </a>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Collected Payment Information
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Click on any record to view detailed information
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Timestamp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Card Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Card Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Expiry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ZIP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {paymentData.map((record, index) => (
                      <tr
                        key={index}
                        onClick={() => setSelectedRecord(record)}
                        className="hover:bg-gray-50 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(record.timestamp).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {record.fullName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                          {showCardNumbers ? record.cardNumber : maskCardNumber(record.cardNumber)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="flex items-center">
                            <span className="capitalize mr-2">{record.cardType}</span>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {getCardType(record.cardNumber)}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.expiryMonth}/{record.expiryYear}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {record.zipCode}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Detailed View Modal */}
        {selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Payment Record Details</h3>
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Timestamp</label>
                  <p className="text-sm text-gray-900">{new Date(selectedRecord.timestamp).toLocaleString()}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Full Name</label>
                  <p className="text-sm text-gray-900">{selectedRecord.fullName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Card Number</label>
                  <p className="text-sm text-gray-900 font-mono">
                    {showCardNumbers ? selectedRecord.cardNumber : maskCardNumber(selectedRecord.cardNumber)}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Card Type</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedRecord.cardType}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Brand</label>
                    <p className="text-sm text-gray-900">{getCardType(selectedRecord.cardNumber)}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Month</label>
                    <p className="text-sm text-gray-900">{selectedRecord.expiryMonth}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Expiry Year</label>
                    <p className="text-sm text-gray-900">{selectedRecord.expiryYear}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CVV</label>
                    <p className="text-sm text-gray-900 font-mono">
                      {showCardNumbers ? selectedRecord.cvv : '•••'}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">ZIP Code</label>
                  <p className="text-sm text-gray-900">{selectedRecord.zipCode}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t">
                <button
                  onClick={() => setSelectedRecord(null)}
                  className="w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;