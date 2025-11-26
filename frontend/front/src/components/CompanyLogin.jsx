import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { ArrowLeft } from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();

export default function CompanyLogin({ onNavigate, onLoginSuccess, notice = '' }) {
  const [formValues, setFormValues] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formValues.email,
          password: formValues.password,
          role: 'company',
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Unable to log in. Please try again.');
      }

      onLoginSuccess?.({ token: data.token, user: data.user });
    } catch (err) {
      setErrorMessage(err.message || 'Unexpected error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#ebe3d5' }}>
      {/* Header */}
      <div className="py-6 px-4" style={{ backgroundColor: '#733635' }}>
        <div className="container mx-auto">
          <Button 
            variant="ghost" 
            onClick={() => onNavigate('home')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </div>

      {/* Login Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#733635' }}>Company Login</CardTitle>
              <CardDescription>Access your company partner portal</CardDescription>
            </CardHeader>
            <CardContent>
              {notice && (
                <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  {notice}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-email">Email</Label>
                  <Input
                    id="company-email"
                    name="email"
                    type="email"
                    placeholder="company@example.com"
                    value={formValues.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-password">Password</Label>
                  <Input
                    id="company-password"
                    name="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formValues.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </div>
                {errorMessage && (
                  <p className="text-sm text-red-500">{errorMessage}</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full text-white"
                  style={{ backgroundColor: '#733635' }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Signing in…' : 'Login'}
                </Button>
                <div className="mt-4 text-center text-sm">
                  <span className="text-gray-600">No account? </span>
                  <button
                    type="button"
                    onClick={() => onNavigate('company-register')}
                    className="text-blue-600 hover:text-blue-800 underline font-medium"
                  >
                    Create one here
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

