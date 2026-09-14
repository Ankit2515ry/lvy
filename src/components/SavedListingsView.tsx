import React, { useState, useEffect } from 'react';
import { Listing, User } from '../types';
import { api } from '../services/api';
import { formatPrice } from './ListingDetailModal';
import { Bookmark, Trash2, MapPin, ExternalLink, ShieldCheck, Building2 } from 'lucide-react';

interface SavedListingsViewProps {
  currentUser: User | null;
  onSelectListing: (id: string) => void;
  onRefreshSavedCount: () => void;
}

export const SavedListingsView: React.FC<SavedListingsViewProps> = ({
  currentUser,
  onSelectListing,
  onRefreshSavedCount
}) => {
  const [savedListings, setSavedListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchSaved = () => {
    setLoading(true);
    api.getSavedListings()
      .then(res => {
        setSavedListings(res);
      })
      .catch(err => {
        console.error('Failed to load saved listings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSaved();
  }, [currentUser?.email]);

  const handleRemove = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      setRemovingId(id);
      await api.unsaveListing(id);
      setSavedListings(prev => prev.filter(x => x.listing_id !== id));
      onRefreshSavedCount();
    } catch (err) {
      console.error('Failed to remove saved property:', err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <Bookmark size={28} color="var(--primary)" />
            <h1 style={{ fontSize: '2.5rem' }}>
              Saved Properties
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            Properties bookmarked by <strong style={{ color: '#fff' }}>{currentUser?.email || 'Current User'}</strong>.
            Persisted server-side across reloads and user sessions via <code style={{ color: 'var(--primary)', background: 'var(--bg-tertiary)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>/v1/saved</code>.
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading your saved properties...</p>
          </div>
        ) : savedListings.length === 0 ? (
          <div className="glass-card" style={{ padding: '4.5rem 2rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
            <div style={{
              width: '4rem',
              height: '4rem',
              borderRadius: 'var(--radius-full)',
              background: 'var(--primary-light)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              color: 'var(--primary)'
            }}>
              <Bookmark size={32} />
            </div>
            <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>No Saved Properties Yet</h3>
            <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
              When you browse the property listings or view details, click the bookmark icon to save properties to your account.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {savedListings.map(item => (
              <div
                key={item.listing_id}
                className="glass-card"
                style={{ padding: '1.5rem', cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
                onClick={() => onSelectListing(item.listing_id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    {item.is_live ? (
                      <span className="badge badge-live">Live</span>
                    ) : (
                      <span className="badge badge-inactive">Inactive</span>
                    )}
                    {item.is_verified && (
                      <span className="badge badge-verified">
                        <ShieldCheck size={11} />
                        Verified
                      </span>
                    )}
                  </div>
                  <button
                    onClick={(e) => handleRemove(e, item.listing_id)}
                    disabled={removingId === item.listing_id}
                    className="btn-icon"
                    title="Remove from saved"
                    style={{ color: 'var(--rose)', background: 'var(--rose-light)' }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>
                  {item.apartment_name || 'Independent Residence'}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span style={{ textTransform: 'capitalize' }}>{item.locality}, Bangalore</span>
                </div>

                {/* Price & Area */}
                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between',
                  marginBottom: '1rem'
                }}>
                  <div>
                    <span style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{item.bedroom} BHK</span>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.carpet_area_sqft || item.carpet_area} sq ft</p>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>Floor {item.floor}/{item.total_floors}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--primary)' }}>
                    <span>View Details</span>
                    <ExternalLink size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
