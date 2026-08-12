import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  Warehouse,
  FileText,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Role } from '../../types';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { to: '/dashboard',  icon: <LayoutDashboard size={18} />, label: 'Dashboard', roles: ['admin', 'sales', 'warehouse', 'accounts'] },
  { to: '/customers',  icon: <Users size={18} />,           label: 'Customers', roles: ['admin', 'sales', 'accounts'] },
  { to: '/products',   icon: <Package size={18} />,         label: 'Products',  roles: ['admin', 'warehouse'] },
  { to: '/inventory',  icon: <Warehouse size={18} />,       label: 'Inventory', roles: ['admin', 'warehouse'] },
  { to: '/challans',   icon: <FileText size={18} />,        label: 'Challans',  roles: ['admin', 'sales', 'accounts'] },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();

  const visibleItems = NAV_ITEMS.filter((item) =>
    user ? hasRole(item.roles) : false
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <nav
        className={`sidebar ${isOpen ? 'open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Logo */}
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon" aria-hidden="true">
            <Zap size={18} color="white" />
          </div>
          <div className="sidebar-logo-text">
            <span className="sidebar-logo-name">NexERP</span>
            <span className="sidebar-logo-tagline">Operations Portal</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="sidebar-nav" role="list">
          <div className="sidebar-section">
            <span className="sidebar-section-label">Main Menu</span>
          </div>

          {visibleItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
              onClick={onClose}
              role="listitem"
              aria-current={undefined}
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <div className="sidebar-section" style={{ marginTop: 'auto' }}>
            <span className="sidebar-section-label">System</span>
          </div>

          <NavLink
            to="/settings"
            className={({ isActive }) => `sidebar-item${isActive ? ' active' : ''}`}
            onClick={onClose}
          >
            <Settings size={18} />
            Settings
          </NavLink>
        </div>

        {/* Footer: user info + logout */}
        <div className="sidebar-footer">
          {user && (
            <div style={{ padding: 'var(--space-3) var(--space-5)', marginBottom: 'var(--space-1)' }}>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'rgba(148,163,184,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600, marginBottom: 4 }}>
                Signed in as
              </p>
              <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--sidebar-text-hover)', fontWeight: 500 }}>
                {user.name}
              </p>
              <p style={{ fontSize: 'var(--font-size-xs)', color: 'var(--sidebar-text)', textTransform: 'capitalize' }}>
                {user.role}
              </p>
            </div>
          )}
          <button className="sidebar-item" onClick={handleLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </nav>
    </>
  );
}
