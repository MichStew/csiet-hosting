import { useEffect, useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CompanyLogin from './components/CompanyLogin';
import CompanyRegister from './components/CompanyRegister';
import MemberLogin from './components/MemberLogin';
import MemberRegister from './components/MemberRegister';
import ContactUs from './components/ContactUs';
import MemberInfo from './components/MemberInfo';
import Dashboard from './components/Dashboard';

const AUTH_STORAGE_KEY = 'csiet.auth';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const createEmptyAuthState = () => ({ token: null, user: null });
  const [authState, setAuthState] = useState(() => {
    if (typeof window === 'undefined') {
      return createEmptyAuthState();
    }
    try {
      const stored = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!stored) {
        return createEmptyAuthState();
      }
      const parsed = JSON.parse(stored);
      if (parsed?.token) {
        return parsed;
      }
    } catch (err) {
      console.warn('Unable to parse stored auth state:', err);
    }
    return createEmptyAuthState();
  });
  const [sessionNotice, setSessionNotice] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    if (authState?.token) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authState));
    } else {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [authState]);

  const isAuthenticated = Boolean(authState.token);

  const handleLoginSuccess = (authPayload) => {
    setSessionNotice('');
    setAuthState(authPayload);
    setCurrentPage('dashboard');
  };

  const handleProfileUpdate = (updatedUser) => {
    setAuthState((prev) => {
      if (!prev?.token) {
        return { token: null, user: updatedUser };
      }
      return { ...prev, user: updatedUser };
    });
  };

  const resetAuthState = () => {
    setAuthState(createEmptyAuthState());
  };

  const handleLogout = (redirectPage = 'home') => {
    resetAuthState();
    setSessionNotice('');
    setCurrentPage(redirectPage);
  };

  const handleSessionExpired = (message = 'Your session expired. Please log in again.') => {
    resetAuthState();
    setSessionNotice(message);
    setCurrentPage('member-login');
  };

  const handleNavigate = (destination) => {
    if ((destination === 'member-directory' || destination === 'dashboard') && !isAuthenticated) {
      setCurrentPage('member-login');
      return;
    }
    setCurrentPage(destination);
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
          />
        );
      case 'company-login':
        return (
          <CompanyLogin
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            notice={sessionNotice}
          />
        );
      case 'company-register':
        return (
          <CompanyRegister
            onNavigate={handleNavigate}
            onRegisterSuccess={handleLoginSuccess}
          />
        );
      case 'member-login':
        return (
          <MemberLogin
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
            notice={sessionNotice}
          />
        );
      case 'member-register':
        return (
          <MemberRegister
            onNavigate={handleNavigate}
            onRegisterSuccess={handleLoginSuccess}
          />
        );
      case 'contact':
        return <ContactUs onNavigate={handleNavigate} />;
      case 'member-directory':
        return (
          <MemberInfo
            onNavigate={handleNavigate}
            auth={authState}
            onProfileUpdate={handleProfileUpdate}
            onSessionExpired={handleSessionExpired}
          />
        );
      case 'dashboard':
        return (
          <Dashboard
            onNavigate={handleNavigate}
            auth={authState}
            onProfileUpdate={handleProfileUpdate}
            onSessionExpired={handleSessionExpired}
          />
        );
      default:
        return (
          <HomePage
            onNavigate={handleNavigate}
            isAuthenticated={isAuthenticated}
          />
        );
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebe3d5' }}>
      {currentPage === 'home' && (
        <Header
          onNavigate={handleNavigate}
          isAuthenticated={isAuthenticated}
          onLogout={handleLogout}
          user={authState.user}
        />
      )}
      {renderPage()}
    </div>
  );
}
