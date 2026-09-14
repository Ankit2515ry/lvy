import React, { useState, useEffect } from 'react';
import { Project, Rental } from '../types';
import { api } from '../services/api';
import { formatPrice } from './ListingDetailModal';
import { Key, Building, MapPin, Calendar, Layers, ShieldCheck, Phone, Check, AlertCircle } from 'lucide-react';

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

export const RentalsProjectsView: React.FC = () => {
  const [subTab, setSubTab] = useState<'rentals' | 'projects'>('rentals');
  const [locality, setLocality] = useState('all');
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    if (subTab === 'rentals') {
      api.getRentals(locality === 'all' ? undefined : locality, undefined, 0, 50)
        .then(res => setRentals(res.results))
        .catch(err => console.error('Rentals fetch failed:', err))
        .finally(() => setLoading(false));
    } else {
      api.getProjects(locality === 'all' ? undefined : locality, undefined, 0, 50)
        .then(res => setProjects(res.results))
        .catch(err => console.error('Projects fetch failed:', err))
        .finally(() => setLoading(false));
    }
  }, [subTab, locality]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="container">
        {/* Header & Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>
              {subTab === 'rentals' ? 'Rental Homes' : 'Builder Projects'} in <span className="gradient-text">Bangalore</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {subTab === 'rentals'
                ? 'Verified residential properties available for monthly lease with honest deposits.'
                : 'Upcoming & ready-to-move builder developments with standardized crore valuations and RERA tracking.'}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.3rem', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setSubTab('rentals')}
              className={`btn ${subTab === 'rentals' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.5rem 1.25rem' }}
            >
              <Key size={16} />
              <span>Rentals</span>
            </button>
            <button
              onClick={() => setSubTab('projects')}
              className={`btn ${subTab === 'projects' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ padding: '0.5rem 1.25rem' }}
            >
              <Building size={16} />
              <span>Projects</span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-card" style={{ padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Filter Locality:</span>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {LOCALITIES.map(loc => {
              const val = loc === 'All Localities' ? 'all' : loc;
              const isSelected = locality === val;
              const isAssigned = val === 'indiranagar';
              return (
                <button
                  key={loc}
                  onClick={() => setLocality(val)}
                  style={{
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.8rem',
                    fontWeight: isAssigned ? 700 : 500,
                    borderRadius: 'var(--radius-full)',
                    border: isSelected ? '1px solid var(--primary)' : isAssigned ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--primary)' : isAssigned ? 'var(--amber-light)' : 'rgba(255, 255, 255, 0.03)',
                    color: isSelected ? '#fff' : isAssigned ? '#fbbf24' : 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'var(--transition)'
                  }}
                >
                  {loc.charAt(0).toUpperCase() + loc.slice(1)}
                  {isAssigned && ' (Assigned)'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: '5rem 0', textAlign: 'center' }}>
            <div className="animate-spin" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem' }} />
            <p style={{ color: 'var(--text-secondary)' }}>Fetching {subTab}...</p>
          </div>
        ) : subTab === 'rentals' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {rentals.map(r => (
              <div key={r.listing_id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span className="badge badge-live">For Rent</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>via {r.website}</span>
                </div>

                <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '0.25rem' }}>
                  {r.apartment_name || r.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem' }}>
                  <MapPin size={14} color="var(--primary)" />
                  <span style={{ textTransform: 'capitalize' }}>{r.locality}, Bangalore</span>
                </div>

                {/* Pricing Box */}
                <div style={{
                  background: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'baseline',
                  justifyContent: 'space-between'
                }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      ₹{r.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}> / month</span>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span>Deposit: ₹{(r.deposit / 100000).toFixed(1)}L</span>
                  </div>
                </div>

                {/* Specs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <div>Layout: <strong>{r.bedroom} BHK</strong></div>
                  <div>Area: <strong>{r.carpet_area} sq ft</strong></div>
                  <div>Floor: <strong>{r.floor}/{r.total_floors}</strong></div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Posted by {r.posted_by_name} ({r.posted_by})</span>
                  <button
                    onClick={() => handleCopy(r.listing_id, r.posted_by_contact)}
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {copiedId === r.listing_id ? <Check size={13} color="var(--emerald)" /> : <Phone size={13} />}
                    <span>{copiedId === r.listing_id ? 'Copied' : r.posted_by_contact}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '1.5rem' }}>
            {projects.map(p => {
              // Convert Crore to clean INR strings
              const minPriceStr = `₹${p.price_min} Cr`;
              const maxPriceStr = `₹${p.price_max} Cr`;

              return (
                <div key={p.project_id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-verified">
                      <ShieldCheck size={12} />
                      {p.developer_name}
                    </span>
                    <span className="badge badge-unit" style={{ textTransform: 'capitalize' }}>
                      {p.project_status}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.35rem', color: '#fff', marginBottom: '0.2rem' }}>
                    {p.apartment_name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
                    <MapPin size={14} color="var(--primary)" />
                    <span style={{ textTransform: 'capitalize' }}>{p.locality}, Bangalore</span>
                  </div>

                  {/* Valuation & Unit Range */}
                  <div style={{
                    background: 'var(--bg-tertiary)',
                    padding: '1rem',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Price Range</span>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {minPriceStr} - {maxPriceStr}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <span>Unit Sizes:</span>
                      <strong>{p.min_area_sqft} - {p.max_area_sqft} sq ft</strong>
                    </div>
                  </div>

                  {/* Project Details Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <div>Towers: <strong>{p.total_towers}</strong></div>
                    <div>Floors: <strong>{p.total_floors}</strong></div>
                    <div>Units: <strong>{p.total_units}</strong></div>
                  </div>

                  {/* Possession & RERA */}
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <div>Possession: <strong style={{ color: 'var(--text-secondary)' }}>{p.possession_date}</strong></div>
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      RERA: <strong style={{ color: 'var(--text-secondary)' }}>{p.rera_number}</strong>
                    </div>
                  </div>

                  {/* Amenities Tags */}
                  {p.amenities && p.amenities.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
                      {p.amenities.slice(0, 4).map((a, i) => (
                        <span key={i} className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.65rem' }}>
                          {a}
                        </span>
                      ))}
                      {p.amenities.length > 4 && (
                        <span className="badge" style={{ background: 'rgba(255, 255, 255, 0.05)', fontSize: '0.65rem' }}>
                          +{p.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Available listings indicator */}
                  <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Project Inventory</span>
                    <span className="badge gradient-badge" style={{ fontSize: '0.75rem' }}>
                      {p.total_listings} Available
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
