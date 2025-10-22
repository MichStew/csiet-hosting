import { useState } from 'react';
import Header from './components/Header';
import HomePage from './components/HomePage';
import CompanyLogin from './components/CompanyLogin';
import MemberLogin from './components/MemberLogin';
import ContactUs from './components/ContactUs';
import MemberInfo from './components/MemberInfo';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage onNavigate={setCurrentPage} />;
      case 'company-login':
        return <CompanyLogin onNavigate={setCurrentPage} />;
      case 'member-login':
        return <MemberLogin onNavigate={setCurrentPage} />;
      case 'contact':
        return <ContactUs onNavigate={setCurrentPage} />;
      case 'member-directory':
        return <MemberInfo onNavigate={setCurrentPage} />;
      default:
        return <HomePage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebe3d5' }}>
      {currentPage === 'home' && <Header onNavigate={setCurrentPage} />}
      {renderPage()}
    </div>
  );
}

