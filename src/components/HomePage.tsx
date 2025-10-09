import React from 'react';
import { ShieldCheck, ArrowLeft, AlertTriangle, Eye, Lock, ArrowRight } from 'lucide-react';

interface HomePageProps {
  onBackToPayment: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ onBackToPayment }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        {/* <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-green-500 p-4 rounded-full">
              <ShieldCheck className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🎓 Congratulations! You've Completed the Demo
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            This was an educational demonstration of how payment scams work
          </p>
        </div> */}

        {/* Warning Box */}
        {/* <div className="bg-red-50 border-l-4 border-red-500 p-6 mb-8 rounded-lg">
          <div className="flex items-start">
            <AlertTriangle className="w-8 h-8 text-red-500 mr-4 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                🚨 IMPORTANT: Your Data Has Been Collected!
              </h3>
              <p className="text-red-700 mb-4">
                In this educational demo, all the payment information you entered has been stored locally in your browser. 
                In a real scam scenario, this data would be sent to malicious actors who could use it for identity theft 
                and financial fraud.
              </p>
              <div className="bg-red-100 p-3 rounded-md">
                <p className="text-red-800 font-medium">
                  <strong>Key Learning:</strong> Never enter real payment information on suspicious websites, 
                  even if they look legitimate!
                </p>
              </div>
            </div>
          </div>
        </div> */}

        {/* Educational Content */}
        {/* <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Eye className="w-6 h-6 text-blue-500 mr-2" />
              Red Flags to Watch For
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                URLs that don't match the company name
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Missing HTTPS (secure connection) indicators
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Urgent language pressuring immediate action
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Poor grammar and spelling errors
              </li>
              <li className="flex items-start">
                <span className="text-red-500 mr-2">•</span>
                Requests for unusual payment methods
              </li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Lock className="w-6 h-6 text-green-500 mr-2" />
              How to Stay Safe
            </h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Always verify website authenticity
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Look for secure payment badges and HTTPS
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Use official company websites directly
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Enable two-factor authentication
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">•</span>
                Monitor your accounts regularly
              </li>
            </ul>
          </div>
        </div> */}

        {/* Statistics */}
        {/* <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
          <h3 className="text-2xl font-semibold text-gray-900 text-center mb-6">
            Online Payment Fraud Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">$5.6B</div>
              <p className="text-gray-600">Lost to payment fraud in 2023</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">65%</div>
              <p className="text-gray-600">Increase in online scams</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1 in 4</div>
              <p className="text-gray-600">People have encountered payment scams</p>
            </div>
          </div>
        </div> */}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            // onClick={onBackToPayment}
            onClick={()=>window.location.href="https://devmint.site/pricing/"}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Continue to Devmint
          </button>
          
          {/* <a
            href="#admin-view-data-2024"
            className="flex items-center justify-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            onClick={() => window.location.hash = '#admin-view-data-2024'}
          >
            View Collected Data (Admin)
          </a> */}
        </div>

        {/* Educational Note */}
        {/* <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            This educational project demonstrates cybersecurity risks. Always stay vigilant and protect your personal information online.
          </p>
        </div> */}
      </div>
    </div>
  );
};

export default HomePage;