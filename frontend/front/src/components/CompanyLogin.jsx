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
  const [resetValues, setResetValues] = useState({ token: '', newPassword: '' });
  const [verificationValues, setVerificationValues] = useState({ token: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [mode, setMode] = useState('login'); // login | forgot | reset | verify

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSuccessMessage('');

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
        if (data?.message?.toLowerCase().includes('verify')) {
          switchMode('verify');
        }
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
              {successMessage && (
                <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                  {successMessage}
                </div>
              )}
              {errorMessage && (
                <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {errorMessage}
                </div>
              )}
              {mode === 'login' && (
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
                  <div className="flex flex-col gap-2 text-sm text-blue-700">
                    <button type="button" onClick={() => switchMode('forgot')} className="underline text-left">
                      Forgot password?
                    </button>
                    <button type="button" onClick={() => switchMode('verify')} className="underline text-left">
                      Need to verify your email?
                    </button>
                  </div>
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
              )}

              {mode === 'forgot' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/auth/request-password-reset`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email: formValues.email, role: 'company' }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        throw new Error(data?.message || 'Unable to send reset email.');
                      }
                      setSuccessMessage(data?.message || 'If an account exists, a reset link has been sent.');
                      if (data?.resetToken) {
                        setResetValues((prev) => ({ ...prev, token: data.resetToken }));
                      }
                    } catch (err) {
                      setErrorMessage(err.message || 'Unexpected error.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-700">
                    Enter the email you used to sign up. We&apos;ll send reset instructions.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      name="email"
                      type="email"
                      placeholder="company@example.com"
                      value={formValues.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ backgroundColor: '#733635' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Sending…' : 'Send reset link'}
                  </Button>
                  <button type="button" onClick={() => switchMode('reset')} className="text-sm text-blue-700 underline">
                    Already have a reset code?
                  </button>
                  <button type="button" onClick={() => switchMode('login')} className="text-sm text-blue-700 underline">
                    Back to login
                  </button>
                </form>
              )}

              {mode === 'reset' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          token: resetValues.token,
                          newPassword: resetValues.newPassword,
                        }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        throw new Error(data?.message || 'Unable to reset password.');
                      }
                      setSuccessMessage(data?.message || 'Password reset. You can log in now.');
                      setResetValues({ token: '', newPassword: '' });
                      setMode('login');
                    } catch (err) {
                      setErrorMessage(err.message || 'Unexpected error.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="reset-token">Reset code</Label>
                    <Input
                      id="reset-token"
                      name="token"
                      type="text"
                      placeholder="Paste the reset code"
                      value={resetValues.token}
                      onChange={(e) => setResetValues((prev) => ({ ...prev, token: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-new-password">New password</Label>
                    <Input
                      id="reset-new-password"
                      name="newPassword"
                      type="password"
                      placeholder="Enter a new password"
                      value={resetValues.newPassword}
                      onChange={(e) => setResetValues((prev) => ({ ...prev, newPassword: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ backgroundColor: '#733635' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Resetting…' : 'Reset password'}
                  </Button>
                  <button type="button" onClick={() => switchMode('login')} className="text-sm text-blue-700 underline">
                    Back to login
                  </button>
                </form>
              )}

              {mode === 'verify' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setIsSubmitting(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                    try {
                      const res = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ token: verificationValues.token }),
                      });
                      const data = await res.json().catch(() => ({}));
                      if (!res.ok) {
                        throw new Error(data?.message || 'Unable to verify email.');
                      }
                      setSuccessMessage(data?.message || 'Email verified. You can log in now.');
                      setVerificationValues({ token: '' });
                      setMode('login');
                    } catch (err) {
                      setErrorMessage(err.message || 'Unexpected error.');
                    } finally {
                      setIsSubmitting(false);
                    }
                  }}
                  className="space-y-4"
                >
                  <p className="text-sm text-gray-700">
                    Paste the verification code from your email. Need a new one? Request below.
                  </p>
                  <div className="space-y-2">
                    <Label htmlFor="verification-token">Verification code</Label>
                    <Input
                      id="verification-token"
                      name="token"
                      type="text"
                      placeholder="Verification code"
                      value={verificationValues.token}
                      onChange={(e) => setVerificationValues({ token: e.target.value })}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full text-white"
                    style={{ backgroundColor: '#733635' }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Verifying…' : 'Verify email'}
                  </Button>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsSubmitting(true);
                      setErrorMessage('');
                      setSuccessMessage('');
                      try {
                        const res = await fetch(`${API_BASE_URL}/api/auth/request-verification`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ email: formValues.email, role: 'company' }),
                        });
                        const data = await res.json().catch(() => ({}));
                        if (!res.ok) {
                          throw new Error(data?.message || 'Unable to send verification email.');
                        }
                        setSuccessMessage(data?.message || 'Verification email sent.');
                        if (data?.verificationToken) {
                          setVerificationValues({ token: data.verificationToken });
                        }
                      } catch (err) {
                        setErrorMessage(err.message || 'Unexpected error.');
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="text-sm text-blue-700 underline"
                  >
                    Resend verification email
                  </button>
                  <button type="button" onClick={() => switchMode('login')} className="text-sm text-blue-700 underline">
                    Back to login
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
