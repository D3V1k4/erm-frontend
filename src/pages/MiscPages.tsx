import React from 'react';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AccessDeniedPage() {
  const navigate = useNavigate();
  
  return (
    <div className="access-denied-page">
      <div className="access-denied-container">
        <div className="error-state-icon" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error)' }}>
          <ShieldAlert size={32} />
        </div>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>
          Access Denied
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
          You don't have permission to view this page. If you believe this is a mistake, please contact your system administrator.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Return to Dashboard
        </button>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  const navigate = useNavigate();
  
  return (
    <div className="access-denied-page">
      <div className="access-denied-container">
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-border-hover)', lineHeight: 1, marginBottom: 'var(--space-4)' }}>
          404
        </h1>
        <h2 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>
          Page not found
        </h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-6)', lineHeight: 1.6 }}>
          The page you are looking for doesn't exist or has been moved.
        </p>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export function SettingsPage() {
  return (
    <div>
      <h1 className="page-title" style={{ marginBottom: 'var(--space-6)' }}>System Settings</h1>
      <div className="card">
        <div className="card-body">
          <p className="text-secondary">Settings module is currently under development.</p>
        </div>
      </div>
    </div>
  );
}
