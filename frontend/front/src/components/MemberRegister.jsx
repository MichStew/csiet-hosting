import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { ArrowLeft } from 'lucide-react';
import { getApiBaseUrl } from '../utils/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

const API_BASE_URL = getApiBaseUrl();

const ALLOWED_YEARS = ['Freshman', 'Sophomore', 'Junior', 'Senior', 'Graduate'];

export default function MemberRegister({ onNavigate, onRegisterSuccess }) {
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    major: '',
    year: '',
    interests: '',
    resumeUrl: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleYearChange = (value) => {
    setFormValues((prev) => ({ ...prev, year: value }));
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

    try {
      // Parse interests from comma-separated string
      const interestsArray = formValues.interests
        ? formValues.interests.split(',').map((i) => i.trim()).filter(Boolean)
        : [];

      const requestBody = {
        email: formValues.email,
        password: formValues.password,
        name: formValues.name,
        major: formValues.major || undefined,
        year: formValues.year || undefined,
        interests: interestsArray.length > 0 ? interestsArray : undefined,
        resumeUrl: formValues.resumeUrl || undefined,
      };

      console.log('Sending registration request to:', `${API_BASE_URL}/api/auth/register`);
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
          body: text.substring(0, 500), // First 500 chars
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
          onNavigate('member-login');
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
            onClick={() => onNavigate('member-login')}
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
              <CardTitle style={{ color: '#733635' }}>Create Account</CardTitle>
              <CardDescription>Join CSIET as a new member</CardDescription>
            </CardHeader>
            <CardContent>
              {successMessage && (
                <div className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-900">
                  {successMessage}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Full Name *</Label>
                  <Input
                    id="register-name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formValues.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email *</Label>
                  <Input
                    id="register-email"
                    name="email"
                    type="email"
                    placeholder="member@email.sc.edu"
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
                <div className="space-y-2">
                  <Label htmlFor="register-major">Major</Label>
                  <Input
                    id="register-major"
                    name="major"
                    type="text"
                    placeholder="Computer Science"
                    value={formValues.major}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-year">Year</Label>
                  <Select value={formValues.year} onValueChange={handleYearChange}>
                    <SelectTrigger id="register-year">
                      <SelectValue placeholder="Select your year" />
                    </SelectTrigger>
                    <SelectContent>
                      {ALLOWED_YEARS.map((year) => (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-interests">Interests</Label>
                  <Input
                    id="register-interests"
                    name="interests"
                    type="text"
                    placeholder="Web Development, AI, Machine Learning (comma-separated)"
                    value={formValues.interests}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-resume">Resume URL</Label>
                  <Input
                    id="register-resume"
                    name="resumeUrl"
                    type="url"
                    placeholder="https://example.com/resume.pdf"
                    value={formValues.resumeUrl}
                    onChange={handleChange}
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

