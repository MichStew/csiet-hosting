import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { ArrowLeft } from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';

const API_BASE_URL = getApiBaseUrl();

export default function CompanyRegister({ onNavigate, onRegisterSuccess }) {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    employeeName: '',
    phone: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

    // Validation
    if (formValues.password !== formValues.confirmPassword) {
      setErrorMessage('Passwords do not match.');
      setIsSubmitting(false);
      return;
    }

    if (formValues.password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      setIsSubmitting(false);
      return;
    }

    if (!formValues.employeeName.trim()) {
      setErrorMessage('Employee name is required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const requestBody = {
        email: formValues.email,
        password: formValues.password,
        name: formValues.name,
        employeeName: formValues.employeeName,
        phone: formValues.phone || undefined,
        role: 'company', // Set role to 'company' for partners
      };

      console.log('Sending company registration request to:', `${API_BASE_URL}/api/auth/register`);
      console.log('Request body:', { ...requestBody, password: '***' });

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      let data = {};
      const contentType = response.headers.get('content-type');
      
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response received:', {
          status: response.status,
          statusText: response.statusText,
          contentType,
          body: text.substring(0, 500),
        });
        throw new Error(`Server error (${response.status}): ${response.statusText}. Check if backend is running.`);
      }

      try {
        data = await response.json();
      } catch (parseError) {
        const text = await response.text();
        console.error('Failed to parse JSON response:', {
          error: parseError,
          status: response.status,
          statusText: response.statusText,
          body: text.substring(0, 500),
        });
        throw new Error(`Server returned invalid JSON. Status: ${response.status}. Check backend logs.`);
      }

      if (!response.ok) {
        console.error('Registration failed:', {
          status: response.status,
          statusText: response.statusText,
          data,
        });
        throw new Error(data?.message || `Unable to create account (${response.status}). Please try again.`);
      }

      setSuccessMessage('Account created successfully! Redirecting to login...');
      
      // Auto-login after registration
      if (data.token && data.user) {
        setTimeout(() => {
          onRegisterSuccess?.({ token: data.token, user: data.user });
        }, 1500);
      } else {
        // If no auto-login, redirect to login page after 2 seconds
        setTimeout(() => {
          onNavigate('company-login');
        }, 2000);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setErrorMessage(err.message || 'Unexpected error. Please check the console for details.');
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
            onClick={() => onNavigate('company-login')}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Button>
        </div>
      </div>

      {/* Registration Form */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle style={{ color: '#733635' }}>Create Company Account</CardTitle>
              <CardDescription>Register your company as a partner</CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                  {successMessage}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-company-name">Company Name *</Label>
                  <Input
                    id="register-company-name"
                    name="name"
                    type="text"
                    placeholder="Acme Corporation"
                    value={formValues.name}
                    onChange={handleChange}
                    required
                    autoComplete="organization"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-employee-name">Employee Name *</Label>
                  <Input
                    id="register-employee-name"
                    name="employeeName"
                    type="text"
                    placeholder="John Doe"
                    value={formValues.employeeName}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-phone">Phone Number</Label>
                  <Input
                    id="register-phone"
                    name="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={formValues.phone}
                    onChange={handleChange}
                    autoComplete="tel"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email *</Label>
                  <Input
                    id="register-email"
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
                  <Label htmlFor="register-password">Password *</Label>
                  <Input
                    id="register-password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={formValues.password}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-confirm-password">Confirm Password *</Label>
                  <Input
                    id="register-confirm-password"
                    name="confirmPassword"
                    type="password"
                    placeholder="Re-enter your password"
                    value={formValues.confirmPassword}
                    onChange={handleChange}
                    required
                    autoComplete="new-password"
                    minLength={6}
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
                  {isSubmitting ? 'Creating Account…' : 'Create Account'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

