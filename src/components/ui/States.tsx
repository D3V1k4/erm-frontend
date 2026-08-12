import React from 'react';
import { RefreshCw } from 'lucide-react';

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="empty-state" role="status">
      <div className="empty-state-icon" aria-hidden="true">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-description">{description}</p>
      {action}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Something went wrong',
  description = 'Unable to load data. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="error-state" role="alert">
      <div className="error-state-icon" aria-hidden="true">
        <RefreshCw size={22} />
      </div>
      <h3 className="error-state-title">{title}</h3>
      <p className="error-state-description">{description}</p>
      {onRetry && (
        <button className="btn btn-secondary" onClick={onRetry}>
          <RefreshCw size={14} />
          Try Again
        </button>
      )}
    </div>
  );
}

export function LoadingSpinner({ message = 'Loading…' }: { message?: string }) {
  return (
    <div className="loading-full" role="status" aria-label={message}>
      <span className="spinner spinner-lg" aria-hidden="true" />
      <span className="text-secondary">{message}</span>
    </div>
  );
}

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  count?: number;
}

export function Skeleton({ width, height = 14, className = '', count = 1 }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className={`skeleton skeleton-text ${className}`}
          style={{
            width: width ? (typeof width === 'number' ? `${width}px` : width) : undefined,
            height: typeof height === 'number' ? `${height}px` : height,
            marginBottom: count > 1 ? '8px' : undefined,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

// Table row skeleton
export function TableSkeleton({ rows = 5, cols = 6 }: { rows?: number; cols?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIdx) => (
        <tr key={rowIdx} aria-hidden="true">
          {Array.from({ length: cols }).map((_, colIdx) => (
            <td key={colIdx} style={{ padding: '12px 16px' }}>
              <div
                className="skeleton skeleton-text"
                style={{ width: `${60 + Math.random() * 30}%` }}
              />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// Stat card skeleton
export function StatCardSkeleton() {
  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div className="skeleton skeleton-text" style={{ width: 60, height: 12 }} />
        <div className="skeleton" style={{ width: 36, height: 36, borderRadius: 8 }} />
      </div>
      <div className="skeleton skeleton-text lg" style={{ width: '50%', height: 28, marginBottom: 8 }} />
      <div className="skeleton skeleton-text sm" style={{ width: '70%' }} />
    </div>
  );
}
