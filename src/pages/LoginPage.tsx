import React, { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Zap, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../services/api';

export function LoginPage() {
  const { isAuthenticated, login, sessionExpired } = useAuth();
  const location = useLocation();
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [apiError, setApiError]         = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  if (isAuthenticated) return <Navigate to={from} replace />;

  function validate(): boolean {
    const newErrors: typeof errors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) newErrors.email = 'Enter a valid email address';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      setApiError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-icon">
            <Zap size={24} color="white" />
          </div>
          <h1 className="login-logo-name">NexERP</h1>
          <p className="login-logo-tagline">Wholesale Operations & CRM Portal</p>
        </div>

        {/* Card */}
        <div className="login-card">
          <div className="login-card-header">
            <h2 className="login-card-title">Welcome back</h2>
            <p className="login-card-subtitle">Sign in to your account to continue</p>
          </div>

          {/* Session expired banner */}
          {sessionExpired && (
            <div className="login-alert" role="alert" style={{ marginBottom: 'var(--space-4)' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>Your session has expired. Please sign in again.</span>
            </div>
          )}

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* API Error */}
            {apiError && (
              <div className="login-alert" role="alert">
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{apiError}</span>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label className="form-label" htmlFor="email">
                Email address <span className="required" aria-hidden="true">*</span>
              </label>
              <input
                id="email"
                type="email"
                className={`form-control ${errors.email ? 'error' : ''}`}
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined })); }}
                placeholder="you@company.com"
                autoComplete="email"
                autoFocus
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
                disabled={isLoading}
              />
              {errors.email && (
                <span id="email-error" className="form-error" role="alert">
                  <AlertCircle size={12} />
                  {errors.email}
                </span>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label" htmlFor="password">
                Password <span className="required" aria-hidden="true">*</span>
              </label>
              <div className="input-wrapper icon-right">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className={`form-control ${errors.password ? 'error' : ''}`}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  tabIndex={0}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <span id="password-error" className="form-error" role="alert">
                  <AlertCircle size={12} />
                  {errors.password}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary login-submit-btn"
              disabled={isLoading}
            >
              {isLoading && <span className="spinner" aria-hidden="true" />}
              {isLoading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>

        {/* Demo credentials */}
        <div className="login-footer">
          <p style={{ marginBottom: 6 }}>Demo credentials:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', fontSize: '11px' }}>
            {[
              { role: 'Admin',     email: 'admin@nexerp.com',     pw: 'admin123' },
              { role: 'Sales',     email: 'sales@nexerp.com',     pw: 'sales123' },
              { role: 'Warehouse', email: 'warehouse@nexerp.com', pw: 'wh123' },
              { role: 'Accounts',  email: 'accounts@nexerp.com',  pw: 'acc123' },
            ].map((cred) => (
              <button
                key={cred.role}
                type="button"
                style={{
                  fontSize: '11px',
                  padding: '3px 8px',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--color-surface)',
                  color: 'var(--color-text-secondary)',
                  cursor: 'pointer',
                  transition: 'background var(--transition-fast)',
                }}
                onClick={() => { setEmail(cred.email); setPassword(cred.pw); }}
              >
                {cred.role}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
