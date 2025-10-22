import { Button } from './ui/button';

export default function Header({ onNavigate }) {
  return (
    <header className="sticky top-0 z-50" style={{ backgroundColor: '#ebe3d5' }}>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <ImageWithFallback
              src="https://images.unsplash.com/photo-1661347998423-b15d37d6f61e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxidXNpbmVzcyUyMHRlY2glMjBsb2dvfGVufDF8fHx8MTc2MTE1NDg2OXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
              alt="CSIET Logo"
              className="h-12 w-12 rounded-full object-cover"
            />
            <span className="text-2xl" style={{ color: '#733635' }}>CSIET</span>
          </button>
          
          <nav className="flex items-center gap-3">
            <Button 
              variant="outline"
              onClick={() => onNavigate('company-login')}
              className="border-2 bg-white hover:bg-gray-50"
              style={{ borderColor: '#733635', color: '#733635' }}
            >
              Company Login
            </Button>
            <Button 
              variant="outline"
              onClick={() => onNavigate('member-login')}
              className="border-2 bg-white hover:bg-gray-50"
              style={{ borderColor: '#733635', color: '#733635' }}
            >
              Member Login
            </Button>
            <Button 
              onClick={() => onNavigate('contact')}
              className="text-white hover:opacity-90"
              style={{ backgroundColor: '#733635' }}
            >
              Contact Us
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

