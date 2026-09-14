import React, { useEffect, useState } from 'react';
import { Listing } from '../types';
import { api } from '../services/api';
import { X, MapPin, Compass, Layers, ShieldCheck, Phone, User, Bookmark, ExternalLink, AlertTriangle, Sparkles, Check } from 'lucide-react';

interface ListingDetailModalProps {
  listingId: string | null;
  onClose: () => void;
  savedIds: Set<string>;
  onToggleSave: (listing: Listing) => void;
  onSelectListing: (id: string) => void;
}

export const formatPrice = (price: number): string => {
  if (price < 0) return `-₹${Math.abs(price).toLocaleString('en-IN')}`;
  if (price >= 10000000) {
    return `₹${(price / 10000000).toFixed(2)} Cr`;
  }
  if (price >= 100000) {
    return `₹${(price / 100000).toFixed(2)} Lac`;
  }
  return `₹${price.toLocaleString('en-IN')}`;
};

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listingId,
  onClose,
  savedIds,
  onToggleSave,
  onSelectListing
}) => {
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [comparables, setComparables] = useState<Listing[]>([]);

  useEffect(() => {
    if (!listingId) {
      setListing(null);
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError('');

    // Fetch listing details using GET /v1/listings/{id}
    api.getListingById(listingId)
      .then(data => {
        if (isMounted) {
          setListing(data);
          // Fetch comparable listings
          api.getListings({
            locality: data.locality,
            bhk: data.bedroom?.toString(),
            only_live: true
          }, 0, 8).then(compRes => {
            if (isMounted) {
              setComparables(compRes.results.filter(x => x.listing_id !== data.listing_id).slice(0, 4));
            }
          }).catch(() => {});
        }
      })
      .catch(err => {
        if (isMounted) {
          setError(err.message || 'Failed to load listing details');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [listingId]);

  if (!listingId) return null;

  const isSaved = listing ? savedIds.has(listing.listing_id) : false;

  const handleCopyPhone = (phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '780px' }}>
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Loading verified property specs...</p>
          </div>
        ) : error ? (
          <div style={{ padding: '2.5rem', textAlign: 'center' }}>
            <AlertTriangle size={36} color="var(--rose)" style={{ margin: '0 auto 1rem' }} />
            <h3 style={{ color: '#fff', marginBottom: '0.5rem' }}>Failed to Load Listing</h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>{error}</p>
            <button onClick={onClose} className="btn btn-secondary">Close</button>
          </div>
        ) : listing ? (
          <div>
            {/* Header Hero Banner */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
              padding: '1.75rem',
              borderBottom: '1px solid var(--border-subtle)',
              position: 'relative'
            }}>
              <button
                onClick={onClose}
                className="btn-icon"
                style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', borderRadius: 'var(--radius-full)' }}
              >
                <X size={18} />
              </button>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {listing.is_live ? (
                  <span className="badge badge-live">Active Listing</span>
                ) : (
                  <span className="badge badge-inactive">Off-Market / Inactive</span>
                )}
                {listing.is_verified && (
                  <span className="badge badge-verified">
                    <ShieldCheck size={12} />
                    Verified Property
                  </span>
                )}
                {listing.is_unit_converted && (
                  <span className="badge badge-unit" title="Original data was in Square Meters from MagicHomes, normalized to Sq Ft">
                    Normalized (Sq M → Sq Ft)
                  </span>
                )}
                {listing.is_corrupt && (
                  <span className="badge badge-danger" title={listing.corrupt_reason}>
                    <AlertTriangle size={12} />
                    Data Anomaly
                  </span>
                )}
                {listing.is_fake && (
                  <span className="badge badge-warning" title="Suspected lead-generation bait listing with rental pricing">
                    <AlertTriangle size={12} />
                    Enquiry Bait Listing
                  </span>
                )}
              </div>

              <h2 style={{ fontSize: '1.75rem', color: '#fff', marginBottom: '0.25rem' }}>
                {listing.apartment_name || 'Independent Residence'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <MapPin size={16} color="var(--primary)" />
                <span style={{ textTransform: 'capitalize' }}>{listing.locality}, Bangalore</span>
                <span>•</span>
                <span style={{ textTransform: 'capitalize' }}>{listing.property_type}</span>
              </div>
            </div>

            <div style={{ padding: '1.75rem' }}>
              {/* Primary Numbers Row */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: '1rem',
                background: 'var(--bg-tertiary)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.75rem'
              }}>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Price</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{formatPrice(listing.price)}</p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Carpet Area</p>
                  <p style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {listing.carpet_area_sqft || listing.carpet_area} <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>sq ft</span>
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Rate / Sq Ft</p>
                  <p style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--emerald)' }}>
                    {listing.price > 0 && (listing.carpet_area_sqft || listing.carpet_area) > 0 ? (
                      `₹${Math.round(listing.price / (listing.carpet_area_sqft || listing.carpet_area)).toLocaleString('en-IN')}`
                    ) : 'N/A'}
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Layout</p>
                  <p style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    {listing.bedroom} BHK <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-secondary)' }}>({listing.bathroom} Bath)</span>
                  </p>
                </div>
              </div>

              {/* Data Anomaly Warning Box if Corrupt */}
              {listing.is_corrupt && (
                <div style={{
                  padding: '1rem',
                  background: 'var(--rose-light)',
                  border: '1px solid rgba(244, 63, 94, 0.4)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem'
                }}>
                  <AlertTriangle size={20} color="var(--rose)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                  <div>
                    <h4 style={{ color: '#fda4af', fontSize: '0.9rem', marginBottom: '0.2rem' }}>Platform Quality Warning: Physics Violation</h4>
                    <p style={{ color: '#fecdd3', fontSize: '0.8rem' }}>
                      This listing was flagged in our data audit: <strong>{listing.corrupt_reason}</strong>. It represents a corrupted seller record preserved for transparency.
                    </p>
                  </div>
                </div>
              )}

              {/* Key Specs Grid */}
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.85rem' }}>Property Highlights</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Floor Level</span>
                  <p style={{ fontWeight: 600, marginTop: '0.2rem' }}>{listing.floor} of {listing.total_floors}</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Furnishing</span>
                  <p style={{ fontWeight: 600, textTransform: 'capitalize', marginTop: '0.2rem' }}>{listing.furnishing}</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Facing</span>
                  <p style={{ fontWeight: 600, textTransform: 'capitalize', marginTop: '0.2rem' }}>{listing.facing_direction || 'Standard'}</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Covered Parking</span>
                  <p style={{ fontWeight: 600, marginTop: '0.2rem' }}>{listing.covered_parking ?? 1} Slots</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Balcony</span>
                  <p style={{ fontWeight: 600, marginTop: '0.2rem' }}>{listing.balcony ?? 1} Balconies</p>
                </div>
                <div className="glass-card" style={{ padding: '0.75rem 1rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Super Built-Up Area</span>
                  <p style={{ fontWeight: 600, marginTop: '0.2rem' }}>{listing.super_built_up_area ? `${listing.super_built_up_area} sq ft` : 'N/A'}</p>
                </div>
              </div>

              {/* Description */}
              <h3 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.6rem' }}>Description</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                {listing.description || 'No detailed description provided by the seller.'}
              </p>

              {/* Seller Contact & Action Bar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1.25rem',
                background: 'var(--bg-tertiary)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-subtle)',
                marginBottom: '1.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '2.75rem',
                    height: '2.75rem',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--primary-light)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary)'
                  }}>
                    <User size={22} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <p style={{ fontWeight: 700, color: '#fff' }}>{listing.posted_by_name || 'Verified Seller'}</p>
                      <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.08)', fontSize: '0.65rem' }}>
                        {listing.posted_by}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Listed via {listing.website}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <button
                    onClick={() => handleCopyPhone(listing.posted_by_contact)}
                    className="btn btn-secondary"
                    style={{ fontSize: '0.8rem' }}
                  >
                    {copiedPhone ? <Check size={14} color="var(--emerald)" /> : <Phone size={14} />}
                    <span>{copiedPhone ? 'Copied!' : listing.posted_by_contact}</span>
                  </button>
                  <button
                    onClick={() => onToggleSave(listing)}
                    className={`btn ${isSaved ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    <Bookmark size={16} fill={isSaved ? '#fff' : 'none'} />
                    <span>{isSaved ? 'Saved' : 'Save Property'}</span>
                  </button>
                </div>
              </div>

              {/* Comparable Properties Strip (Resolving 404 on /similar) */}
              {comparables.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Sparkles size={16} color="var(--primary)" />
                      <span>Comparable Properties in {listing.locality}</span>
                    </h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {comparables.map(comp => (
                      <div
                        key={comp.listing_id}
                        onClick={() => onSelectListing(comp.listing_id)}
                        className="glass-card"
                        style={{ padding: '0.85rem', cursor: 'pointer' }}
                      >
                        <p style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {comp.apartment_name}
                        </p>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.4rem' }}>
                          {comp.bedroom} BHK • {comp.carpet_area_sqft || comp.carpet_area} sq ft
                        </p>
                        <p style={{ fontWeight: 800, color: 'var(--primary)', fontSize: '0.95rem' }}>
                          {formatPrice(comp.price)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
