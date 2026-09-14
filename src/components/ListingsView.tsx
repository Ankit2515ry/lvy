import React, { useState, useEffect } from 'react';
import { FilterState, Listing } from '../types';
import { api } from '../services/api';
import { formatPrice } from './ListingDetailModal';
import { Search, Filter, Bookmark, ShieldCheck, MapPin, ChevronLeft, ChevronRight, AlertTriangle, Layers } from 'lucide-react';

interface ListingsViewProps {
  onSelectListing: (id: string) => void;
  savedIds: Set<string>;
  onToggleSave: (listing: Listing) => void;
}

const LOCALITIES = [
  'All Localities',
  'indiranagar',
  'koramangala',
  'whitefield',
  'hsr layout',
  'bellandur',
  'electronic city',
  'yelahanka',
  'hebbal',
  'jp nagar',
  'sarjapur road'
];

export const ListingsView: React.FC<ListingsViewProps> = ({
  onSelectListing,
  savedIds,
  onToggleSave
}) => {
  const [filters, setFilters] = useState<FilterState>({
    locality: 'all',
    bhk: 'all',
    property_type: 'all',
    min_price: '',
    max_price: '',
    furnishing: 'all',
    only_live: true,
    search: '',
    sort_by: 'price',
    order: 'asc'
  });

  const [listings, setListings] = useState<Listing[]>([]);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchListings = () => {
    setLoading(true);
    api.getListings(filters, offset, 50)
      .then(res => {
        setListings(res.results);
        setTotal(res.total);
        setHasMore(res.has_more);
      })
      .catch(err => {
        console.error('Failed to fetch listings:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchListings();
  }, [offset, filters.locality, filters.bhk, filters.property_type, filters.furnishing, filters.only_live]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOffset(0);
    fetchListings();
  };

  const handleResetFilters = () => {
    setFilters({
      locality: 'all',
      bhk: 'all',
      property_type: 'all',
      min_price: '',
      max_price: '',
      furnishing: 'all',
      only_live: true,
      search: '',
      sort_by: 'price',
      order: 'asc'
    });
    setOffset(0);
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Hero Title */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
            Browse Properties in <span className="gradient-text">Bangalore</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '650px' }}>
            Real-time sale inventory cross-referenced from 5 major aggregators with verified physical properties and unit normalization.
          </p>
        </div>

        {/* Filter Control Bar */}
        <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <form onSubmit={handleFilterSubmit}>
            {/* Top Search & Locality */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Search Property</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
                  <input
                    type="text"
                    placeholder="Project name or keywords..."
                    className="input-control"
                    style={{ width: '100%', paddingLeft: '2.3rem' }}
                    value={filters.search}
                    onChange={e => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Locality</label>
                <select
                  className="input-control"
                  value={filters.locality}
                  onChange={e => {
                    setFilters({ ...filters, locality: e.target.value });
                    setOffset(0);
                  }}
                >
                  {LOCALITIES.map(loc => (
                    <option key={loc} value={loc === 'All Localities' ? 'all' : loc}>
                      {loc.charAt(0).toUpperCase() + loc.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Bedrooms (BHK)</label>
                <select
                  className="input-control"
                  value={filters.bhk}
                  onChange={e => {
                    setFilters({ ...filters, bhk: e.target.value });
                    setOffset(0);
                  }}
                >
                  <option value="all">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4 BHK</option>
                  <option value="5">5+ BHK</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Property Type</label>
                <select
                  className="input-control"
                  value={filters.property_type}
                  onChange={e => {
                    setFilters({ ...filters, property_type: e.target.value });
                    setOffset(0);
                  }}
                >
                  <option value="all">All Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="villa">Villa</option>
                  <option value="independent house">Independent House</option>
                  <option value="builder floor">Builder Floor</option>
                  <option value="plot">Plot</option>
                </select>
              </div>
            </div>

            {/* Bottom Row: Min/Max Price, Furnishing, Live Toggle */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'flex-end' }}>
              <div className="input-group">
                <label className="input-label">Min Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 5000000"
                  className="input-control"
                  value={filters.min_price}
                  onChange={e => setFilters({ ...filters, min_price: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Max Price (₹)</label>
                <input
                  type="number"
                  placeholder="e.g. 25000000"
                  className="input-control"
                  value={filters.max_price}
                  onChange={e => setFilters({ ...filters, max_price: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Furnishing</label>
                <select
                  className="input-control"
                  value={filters.furnishing}
                  onChange={e => {
                    setFilters({ ...filters, furnishing: e.target.value });
                    setOffset(0);
                  }}
                >
                  <option value="all">Any Furnishing</option>
                  <option value="unfurnished">Unfurnished</option>
                  <option value="semi-furnished">Semi-Furnished</option>
                  <option value="fully-furnished">Fully-Furnished</option>
                </select>
              </div>

              {/* Toggles & Filter Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', height: '2.4rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={filters.only_live}
                    onChange={e => {
                      setFilters({ ...filters, only_live: e.target.checked });
                      setOffset(0);
                    }}
                    style={{ accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <span>Active Only</span>
                </label>

                <button type="submit" className="btn btn-primary" style={{ padding: '0.55rem 1rem' }}>
                  <Filter size={15} />
                  <span>Apply</span>
                </button>
                <button type="button" onClick={handleResetFilters} className="btn btn-ghost" style={{ padding: '0.55rem 0.75rem' }}>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Status Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          <div>
            Showing <strong style={{ color: '#fff' }}>{listings.length}</strong> listings (Offset {offset} of reported {total})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={() => setOffset(Math.max(0, offset - 50))}
              disabled={offset === 0 || loading}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', opacity: offset === 0 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Page {Math.floor(offset / 50) + 1}</span>
            <button
              onClick={() => setOffset(offset + 50)}
              disabled={!hasMore || loading}
              className="btn btn-secondary"
              style={{ padding: '0.4rem 0.75rem', opacity: !hasMore ? 0.4 : 1 }}
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Filtering properties...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem', textAlign: 'center' }}>
            <p style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>No listings matched your criteria</p>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Try broadening your price range or locality filters.</p>
            <button onClick={handleResetFilters} className="btn btn-primary">Reset All Filters</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {listings.map(item => {
              const isSaved = savedIds.has(item.listing_id);
              const ratePerSqft = item.price > 0 && (item.carpet_area_sqft || item.carpet_area) > 0
                ? Math.round(item.price / (item.carpet_area_sqft || item.carpet_area))
                : null;

              return (
                <div
                  key={item.listing_id}
                  className="glass-card"
                  style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer' }}
                  onClick={() => onSelectListing(item.listing_id)}
                >
                  {/* Card Visual Header */}
                  <div style={{
                    height: '130px',
                    background: item.is_corrupt
                      ? 'linear-gradient(135deg, rgba(244, 63, 94, 0.25) 0%, rgba(15, 23, 42, 0.9) 100%)'
                      : 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    padding: '1rem',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    {/* Top Badges */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
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
                        {item.is_unit_converted && (
                          <span className="badge badge-unit">Sq M → Sq Ft</span>
                        )}
                      </div>

                      {/* Bookmark button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleSave(item);
                        }}
                        className={`btn-icon ${isSaved ? 'active' : ''}`}
                        title={isSaved ? 'Remove from saved' : 'Save property'}
                      >
                        <Bookmark size={15} fill={isSaved ? '#f43f5e' : 'none'} />
                      </button>
                    </div>

                    {/* Bottom Property Type & Locality */}
                    <div>
                      <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, letterSpacing: '0.05em' }}>
                        {item.property_type}
                      </p>
                      <h3 style={{ fontSize: '1.2rem', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.apartment_name || 'Independent Residence'}
                      </h3>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '0.75rem' }}>
                      <MapPin size={14} color="var(--primary)" />
                      <span style={{ textTransform: 'capitalize' }}>{item.locality}, Bangalore</span>
                    </div>

                    {/* Price & Area Highlights */}
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
                      <div>
                        <span style={{ fontSize: '1.35rem', fontWeight: 800, color: item.price < 0 ? 'var(--rose)' : '#fff' }}>
                          {formatPrice(item.price)}
                        </span>
                        {ratePerSqft && (
                          <p style={{ fontSize: '0.75rem', color: 'var(--emerald)', fontWeight: 600 }}>
                            ₹{ratePerSqft.toLocaleString('en-IN')}/sq ft
                          </p>
                        )}
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {item.bedroom} BHK
                        </span>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.carpet_area_sqft || item.carpet_area} sq ft
                        </p>
                      </div>
                    </div>

                    {/* Floor & Facing specs */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                      <span>Floor: <strong>{item.floor}/{item.total_floors}</strong></span>
                      <span style={{ textTransform: 'capitalize' }}>{item.furnishing}</span>
                      <span>{item.facing_direction ? `${item.facing_direction}` : ''}</span>
                    </div>

                    {/* Corrupt/Fake flag alerts */}
                    {item.is_corrupt && (
                      <div style={{ padding: '0.4rem 0.6rem', background: 'var(--rose-light)', borderRadius: 'var(--radius-sm)', color: '#fb7185', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
                        <AlertTriangle size={13} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.corrupt_reason}</span>
                      </div>
                    )}
                    {item.is_fake && (
                      <div style={{ padding: '0.4rem 0.6rem', background: 'var(--amber-light)', borderRadius: 'var(--radius-sm)', color: '#fbbf24', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: 'auto' }}>
                        <AlertTriangle size={13} />
                        <span>Rental price enquiry bait</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginTop: '2.5rem' }}>
          <button
            onClick={() => {
              setOffset(Math.max(0, offset - 50));
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={offset === 0 || loading}
            className="btn btn-secondary"
            style={{ opacity: offset === 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
            <span>Previous 50</span>
          </button>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Offset {offset}</span>
          <button
            onClick={() => {
              setOffset(offset + 50);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            disabled={!hasMore || loading}
            className="btn btn-secondary"
            style={{ opacity: !hasMore ? 0.4 : 1 }}
          >
            <span>Next 50</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
