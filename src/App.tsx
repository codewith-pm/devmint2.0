import { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { CreditCard, Shield } from 'lucide-react';
import PaymentForm from './components/PaymentForm';
import AdminPanel from './components/AdminPanel';
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './pages/HomePage';
import PaymentPage from './pages/PaymentPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AboutPage from './pages/AboutPage';
import PricingPage from './pages/PricingPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import RefundPage from './pages/RefundPage';
import SupportPage from './pages/SupportPage';
import Dashboard from './pages/Dashboard';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">Loading...</p>
    </div>
  </div>
);

function App() {
  // const [currentPage, setCurrentPage] = useState('/');
  // useEffect(() => {
  //   const hash = window.location.hash;
  //   if (hash === '#admin-view-data-2024') {
  //     setCurrentPage('/admin');
  //   }
  // }, []);
  useEffect(() => {
    // Remove loading screen when React app is ready
    const removeLoadingScreen = () => {
      const loadingScreen = document.querySelector('.loading-screen');
      if (loadingScreen) {
        
        setTimeout(() => {
          if (loadingScreen.parentNode) {
            loadingScreen.parentNode.removeChild(loadingScreen);
          }
        }, 300);
      }
    };
    

    // Mark root as loaded and remove loading screen
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.classList.add('loaded');
    }
    
    // Remove loading screen with multiple fallbacks
    const timer1 = setTimeout(removeLoadingScreen, 100);
    const timer2 = setTimeout(removeLoadingScreen, 1000);
    const timer3 = setTimeout(removeLoadingScreen, 3000);
    
    // Cleanup timers
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
          <Header />
          <main className="pt-16">
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/pricing" element={<PricingPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/privacy" element={<PrivacyPage />} />
<Route path="/secure-payment" element={<PaymentPage />} />
                <Route path="/refund" element={<RefundPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="/dashboard/*" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
              </Routes>
            </Suspense>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;