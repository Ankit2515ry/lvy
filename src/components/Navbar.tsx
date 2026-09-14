import React, { useState } from 'react';
import { AuthSession } from '../types';
import { api } from '../services/api';
import { Home, Building2, Key, Bookmark, BarChart3, User, LogOut, CheckCircle2, RefreshCw } from 'lucide-react';

interface NavbarProps {
  currentTab: 'listings' | 'rentals-projects' | 'saved' | 'insights';
  setCurrentTab: (tab: 'listings' | 'rentals-projects' | 'saved' | 'insights') => void;
  session: AuthSession | null;
  savedCount: number;
  onOpenLogin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  session,
  savedCount,
  onOpenLogin
}) => {
  const [switchingUser, setSwitchingUser] = useState(false);

  const handleQuickSwitch = async (email: string) => {
    try {
      setSwitchingUser(true);
      await api.login(email, '41c5ac87a8');
    } catch (err) {
      console.error('Quick switch error:', err);
    } finally {
      setSwitchingUser(false);
    }
  };

  return (
    <header className="glass sticky-nav" style={{ position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <div
            onClick={() => setCurrentTab('listings')}
            style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
          >
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(99, 102, 241, 0.4)'
            }}>
              <Home size={20} color="#fff" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Ivy</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--primary)' }}>Homes</span>
                <span className="badge gradient-badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.45rem' }}>Bangalore</span>
              </div>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified Property Intelligence</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              onClick={() => setCurrentTab('listings')}
              className={`btn ${currentTab === 'listings' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              <Building2 size={16} />
              <span>Buy / Sale</span>
            </button>
            <button
              onClick={() => setCurrentTab('rentals-projects')}
              className={`btn ${currentTab === 'rentals-projects' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              <Key size={16} />
              <span>Rent & Projects</span>
            </button>
            <button
              onClick={() => setCurrentTab('saved')}
              className={`btn ${currentTab === 'saved' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem', position: 'relative' }}
            >
              <Bookmark size={16} />
              <span>Saved</span>
              {savedCount > 0 && (
                <span style={{
                  background: 'var(--rose)',
                  color: '#fff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  borderRadius: 'var(--radius-full)',
                  padding: '0.05rem 0.4rem',
                  marginLeft: '0.25rem'
                }}>
                  {savedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentTab('insights')}
              className={`btn ${currentTab === 'insights' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }}
            >
              <BarChart3 size={16} />
              <span>Insights & Audit</span>
            </button>
          </nav>
        </div>

        {/* User Session & Demo Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {session ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {/* Session Alive Badge */}
              <div
                title="Session active with auto-refresh every 12 minutes (never expires)"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  fontSize: '0.75rem',
                  color: 'var(--emerald)',
                  background: 'var(--emerald-light)',
                  padding: '0.3rem 0.6rem',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid rgba(16, 185, 129, 0.3)'
                }}
              >
                <RefreshCw size={12} className={switchingUser ? 'animate-spin' : ''} />
                <span>Auto-refreshed</span>
              </div>

              {/* Quick user switcher */}
              <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', padding: '0.2rem', border: '1px solid var(--border-subtle)' }}>
                {(['demo1@ivy.homes', 'demo2@ivy.homes', 'demo3@ivy.homes'] as const).map(u => {
                  const isActive = session.user?.email === u;
                  const shortName = u.replace('@ivy.homes', '');
                  return (
                    <button
                      key={u}
                      onClick={() => handleQuickSwitch(u)}
                      disabled={switchingUser}
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        borderRadius: 'var(--radius-sm)',
                        border: 'none',
                        cursor: 'pointer',
                        background: isActive ? 'var(--primary)' : 'transparent',
                        color: isActive ? '#fff' : 'var(--text-secondary)',
                        transition: 'var(--transition)'
                      }}
                    >
                      {shortName}
                    </button>
                  );
                })}
              </div>

              {/* Logout button */}
              <button
                onClick={() => api.logout()}
                className="btn-icon"
                title="Log out"
                style={{ padding: '0.45rem' }}
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenLogin} className="btn btn-primary" style={{ padding: '0.45rem 1rem' }}>
              <User size={16} />
              <span>Log in</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
