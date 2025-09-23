import { useState, useEffect } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import BookAppointment from './components/BookAppointment';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import MedicineStore from './components/MedicineStore';
import TestBooking from './components/TestBooking';
import LoginPage from './components/LoginPage';
import { AuthProvider, useAuth } from './contexts/AuthContext';

type Page = 'home' | 'book-appointment' | 'patient-dashboard' | 'doctor-dashboard' | 'medicines' | 'tests' | 'login';

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

// Main app content that uses auth context
function AppContent() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize the page based on authentication status
  useEffect(() => {
    if (!isLoading && !hasInitialized) {
      if (isAuthenticated && user) {
        // User is logged in, redirect to their dashboard
        setCurrentPage(user.userType === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard');
      } else {
        // User is not logged in, stay on home page
        setCurrentPage('home');
      }
      setHasInitialized(true);
    }
  }, [isLoading, isAuthenticated, user, hasInitialized]);

  // Handle navigation from login to appropriate dashboard
  useEffect(() => {
    if (isAuthenticated && user && hasInitialized) {
      if (currentPage === 'login') {
        // Redirect to appropriate dashboard after login
        setCurrentPage(user.userType === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard');
      }
    }
  }, [isAuthenticated, user, currentPage, hasInitialized]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page as Page);
  };

  const handleLogin = (type: 'patient' | 'doctor') => {
    // This is handled by AuthContext now, but we keep it for compatibility
    setCurrentPage(type === 'doctor' ? 'doctor-dashboard' : 'patient-dashboard');
  };

  const handleLogout = () => {
    logout();
    setCurrentPage('home');
    setHasInitialized(false);
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return <LoadingSpinner />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={handleNavigate} isLoggedIn={isAuthenticated} />;
      case 'book-appointment':
        return <BookAppointment onNavigate={handleNavigate} />;
      case 'patient-dashboard':
        return <PatientDashboard onNavigate={handleNavigate} />;
      case 'doctor-dashboard':
        return <DoctorDashboard onNavigate={handleNavigate} />;
      case 'medicines':
        return <MedicineStore onNavigate={handleNavigate} />;
      case 'tests':
        return <TestBooking onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate} 
        isLoggedIn={isAuthenticated}
        userType={user?.userType}
        user={user}
        onLogout={handleLogout}
      />
      {renderPage()}
    </div>
  );
}

// Main App component with AuthProvider
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;