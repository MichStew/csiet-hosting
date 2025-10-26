import { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CompanyLogin from './components/CompanyLogin';
import MemberLogin from './components/MemberLogin';
import ContactUs from './components/ContactUs';
import MemberInfo from './components/MemberInfo';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [authState, setAuthState] = useState({ token: null, user: null });

  const isAuthenticated = Boolean(authState.token);

  const handleLoginSuccess = (authPayload) => {
    setAuthState(authPayload);
    setCurrentPage('member-directory');
  };

  const handleProfileUpdate = (updatedUser) => {
    setAuthState((prev) => ({ ...prev, user: updatedUser }));
  };

  const handleLogout = () => {
    setAuthState({ token: null, user: null });
    setCurrentPage('home');
  };

  const handleNavigate = (destination) => {
    if (destination === 'member-directory' && !isAuthenticated) {
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
        return <CompanyLogin onNavigate={handleNavigate} />;
      case 'member-login':
        return (
          <MemberLogin
            onNavigate={handleNavigate}
            onLoginSuccess={handleLoginSuccess}
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
