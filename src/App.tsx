import React, { useState, useEffect } from 'react';
import { AuthSession, Listing } from './types';
import { api } from './services/api';
import { Navbar } from './components/Navbar';
import { ListingsView } from './components/ListingsView';
import { RentalsProjectsView } from './components/RentalsProjectsView';
import { SavedListingsView } from './components/SavedListingsView';
import { InsightsView } from './components/InsightsView';
import { ListingDetailModal } from './components/ListingDetailModal';
import { LoginModal } from './components/LoginModal';
import { ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<'listings' | 'rentals-projects' | 'saved' | 'insights'>('listings');
  const [session, setSession] = useState<AuthSession | null>(api.getSession());
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  // Subscribe to auth session changes
  useEffect(() => {
    return api.subscribe(newSession => {
      setSession(newSession);
      if (newSession) {
        refreshSavedListings();
      } else {
        setSavedIds(new Set());
      }
    });
  }, []);

  // Listen to hash changes (e.g. #listing-MAG-1002627)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#listing-')) {
        const id = hash.replace('#listing-', '');
        setSelectedListingId(id);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // check on initial load

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const refreshSavedListings = async () => {
    try {
      const saved = await api.getSavedListings();
      setSavedIds(new Set(saved.map(x => x.listing_id)));
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    refreshSavedListings();
  }, [session?.user?.email]);

  const handleToggleSave = async (listing: Listing) => {
    const isSaved = savedIds.has(listing.listing_id);
    try {
      if (isSaved) {
        await api.unsaveListing(listing.listing_id);
        setSavedIds(prev => {
          const next = new Set(prev);
          next.delete(listing.listing_id);
          return next;
        });
      } else {
        await api.saveListing(listing.listing_id);
        setSavedIds(prev => new Set(prev).add(listing.listing_id));
      }
    } catch (err) {
      console.error('Save toggle failed:', err);
    }
  };

  const handleSelectListing = (id: string) => {
    setSelectedListingId(id);
    window.location.hash = `listing-${id}`;
  };

  const handleCloseModal = () => {
    setSelectedListingId(null);
    if (window.location.hash.startsWith('#listing-')) {
      history.pushState(null, '', ' ');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        session={session}
        savedCount={savedIds.size}
        onOpenLogin={() => setIsLoginOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {currentTab === 'listings' && (
          <ListingsView
            onSelectListing={handleSelectListing}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
          />
        )}
        {currentTab === 'rentals-projects' && (
          <RentalsProjectsView />
        )}
        {currentTab === 'saved' && (
          <SavedListingsView
            currentUser={session?.user || null}
            onSelectListing={handleSelectListing}
            onRefreshSavedCount={refreshSavedListings}
          />
        )}
        {currentTab === 'insights' && (
          <InsightsView onSelectListing={handleSelectListing} />
        )}
      </main>

      {/* Listing Detail Drawer/Modal */}
      <ListingDetailModal
        listingId={selectedListingId}
        onClose={handleCloseModal}
        savedIds={savedIds}
        onToggleSave={handleToggleSave}
        onSelectListing={handleSelectListing}
      />

      {/* Auth Login Dialog */}
      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
      />

      {/* Footer */}
      <footer className="glass" style={{ borderTop: '1px solid var(--border-subtle)', padding: '2.5rem 0', marginTop: '4rem' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
              <span style={{ fontWeight: 800, color: '#fff', fontSize: '1.1rem' }}>Ivy Homes</span>
              <span className="badge gradient-badge" style={{ fontSize: '0.65rem' }}>Assignment 2026</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Engineered by <strong>Ankit Kumar</strong> • MNNIT Allahabad • Bengaluru 6-Month Internship
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <ShieldCheck size={16} color="var(--emerald)" />
              <span>Session Auto-Refreshed (Never Expires)</span>
            </span>
            <button
              onClick={() => setCurrentTab('insights')}
              className="btn btn-ghost"
              style={{ fontSize: '0.85rem' }}
            >
              <span>Platform Audit</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};
