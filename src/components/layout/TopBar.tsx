import React, { useState, useRef, useEffect } from 'react';
import { Bell, Search, Menu, ChevronDown, LogOut, User as UserIcon, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { RoleBadge } from '../ui/Badge';

interface TopBarProps {
  onMenuToggle: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [dropdownOpen]);

  const initials = user?.name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'U';

  return (
    <header className="topbar">
      <button
        className="topbar-mobile-toggle"
        onClick={onMenuToggle}
        aria-label="Toggle navigation"
      >
        <Menu size={18} />
      </button>

      <div className="topbar-search" role="search">
        <Search size={15} className="topbar-search-icon" aria-hidden="true" />
        <input
          type="search"
          placeholder="Search customers, products, challans…"
          aria-label="Global search"
        />
      </div>

      <div className="topbar-right">
        <button className="topbar-icon-btn" aria-label="Notifications">
          <Bell size={17} />
          <span className="notification-dot" aria-hidden="true" />
        </button>

        <div className="dropdown" ref={dropdownRef}>
          <button
            className="topbar-user"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-expanded={dropdownOpen}
            aria-haspopup="true"
            aria-label="User menu"
          >
            <div className="topbar-avatar" aria-hidden="true">{initials}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{user?.name}</span>
              <span className="topbar-user-role">{user?.role}</span>
            </div>
            <ChevronDown size={14} style={{ color: 'var(--color-text-muted)', flexShrink: 0 }} />
          </button>

          {dropdownOpen && (
            <div className="dropdown-menu" role="menu">
              <div style={{ padding: 'var(--space-3) var(--space-4)', borderBottom: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                  {user?.name}
                </p>
                <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', marginTop: 2 }}>
                  {user?.email}
                </p>
                <div style={{ marginTop: 'var(--space-2)' }}>
                  {user && <RoleBadge role={user.role} />}
                </div>
              </div>
              <button className="dropdown-item" role="menuitem">
                <UserIcon size={15} />
                Profile
              </button>
              <button className="dropdown-item" role="menuitem">
                <Settings size={15} />
                Settings
              </button>
              <div className="dropdown-separator" />
              <button
                className="dropdown-item danger"
                role="menuitem"
                onClick={() => { setDropdownOpen(false); logout(); }}
              >
                <LogOut size={15} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
