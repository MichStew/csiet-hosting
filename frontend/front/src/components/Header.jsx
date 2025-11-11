import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from './ui/button';

export default function Header({ onNavigate, isAuthenticated, onLogout, user }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const navigateAndClose = (destination) => {
    onNavigate(destination);
    setIsMobileMenuOpen(false);
  };

  const logoutAndClose = () => {
    onLogout?.();
    setIsMobileMenuOpen(false);
  };

  const sharedOutlineClasses = 'border-2 bg-white hover:bg-gray-50';
  const outlineStyles = { borderColor: '#733635', color: '#733635' };

  const renderMenuButtons = (isMobile = false) => (
    <>
      <Button
        variant="outline"
        onClick={() => navigateAndClose('company-login')}
        className={`${sharedOutlineClasses} ${isMobile ? 'w-full justify-center' : ''}`}
        style={outlineStyles}
      >
        Partner Login
      </Button>
      {isAuthenticated ? (
        <>
          <Button
            variant="outline"
            onClick={() => navigateAndClose('member-directory')}
            className={`${sharedOutlineClasses} ${isMobile ? 'w-full justify-center' : ''}`}
            style={outlineStyles}
          >
            Member Directory
          </Button>
          <Button
            variant="ghost"
            onClick={logoutAndClose}
            className={`hover:bg-white/40 ${isMobile ? 'w-full justify-center' : ''}`}
            style={{ color: '#733635' }}
          >
            Logout{user?.name ? ` (${user.name.split(' ')[0]})` : ''}
          </Button>
        </>
      ) : (
        <Button
          variant="outline"
          onClick={() => navigateAndClose('member-login')}
          className={`${sharedOutlineClasses} ${isMobile ? 'w-full justify-center' : ''}`}
          style={outlineStyles}
        >
          Member Login
        </Button>
      )}
      <Button
        onClick={() => navigateAndClose('contact')}
        className={`text-white hover:opacity-90 ${isMobile ? 'w-full justify-center' : ''}`}
        style={{ backgroundColor: '#733635' }}
      >
        Contact Us
      </Button>
    </>
  );

  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#ebe3d5' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              onNavigate('home');
            }}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/logo.png"
              alt="CSIET Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-2xl" style={{ color: '#733635' }}>CSIET</span>
          </button>
          <nav className="hidden flex-wrap items-center gap-3 md:flex">
            {renderMenuButtons()}
          </nav>
          <button
            type="button"
            className="md:hidden rounded-full border border-[#733635]/30 p-2 text-[#733635] transition-colors hover:bg-white"
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 rounded-2xl border border-[#733635]/20 bg-white/90 p-4 shadow-lg backdrop-blur">
            <div className="flex flex-col gap-3">
              {renderMenuButtons(true)}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
