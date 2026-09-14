import React, { useState } from 'react';
import { formatPrice } from './ListingDetailModal';
import { BarChart3, AlertTriangle, ShieldAlert, Sparkles, Building, Database, ArrowUpRight, CheckCircle2, ChevronRight } from 'lucide-react';

interface InsightsViewProps {
  onSelectListing: (id: string) => void;
}

const LOCALITY_DATA = [
  { name: 'indiranagar', median: 18500000, count: 482, avgSqft: 14200 },
  { name: 'koramangala', median: 17200000, count: 512, avgSqft: 13800 },
  { name: 'hsr layout', median: 14500000, count: 468, avgSqft: 12400 },
  { name: 'whitefield', median: 11200000, count: 540, avgSqft: 9800 },
  { name: 'bellandur', median: 12800000, count: 455, avgSqft: 11200 },
  { name: 'sarjapur road', median: 11800000, count: 490, avgSqft: 10400 },
  { name: 'jp nagar', median: 12500000, count: 430, avgSqft: 10900 },
  { name: 'hebbal', median: 13200000, count: 445, avgSqft: 11500 },
  { name: 'yelahanka', median: 9800000, count: 440, avgSqft: 8900 },
  { name: 'electronic city', median: 8500000, count: 438, avgSqft: 7600 },
];

const BHK_DATA = [
  { bhk: '1 BHK', count: 428, share: '9.1%' },
  { bhk: '2 BHK', count: 1682, share: '35.8%' },
  { bhk: '3 BHK', count: 1840, share: '39.1%' },
  { bhk: '4 BHK', count: 590, share: '12.6%' },
  { bhk: '5+ BHK', count: 160, share: '3.4%' }
];

const SAMPLE_CORRUPT_LISTINGS = [
  { id: '100-1001141', type: 'Swapped Coordinates', detail: 'Latitude 77.61405°N, Longitude 13.04753°E (Inverted Bangalore Coordinates)' },
  { id: '100-1002600', type: 'Swapped Coordinates', detail: 'Latitude 77.72520°N, Longitude 13.09749°E (Inverted Bangalore Coordinates)' },
  { id: '100-1001077', type: 'Carpet > SBUA', detail: 'Carpet area (2,146 sq ft) exceeds Super Built-Up Area (1,722 sq ft)' },
  { id: 'ZER-1002667', type: 'Carpet > SBUA', detail: 'Carpet area (1,580 sq ft) exceeds Super Built-Up Area (948 sq ft)' },
  { id: '100-1002884', type: 'Floor > Total Floors', detail: 'Unit on Floor 40 in a 25-floor building' },
  { id: 'MAG-1000179', type: 'Floor > Total Floors', detail: 'Unit on Floor 42 in a 32-floor building' },
  { id: '100-1000753', type: 'Zero Bed / Bath', detail: '0 Bedrooms and 0 Bathrooms recorded for an Apartment unit' },
  { id: '100-1002346', type: 'Negative Price', detail: 'Sale price recorded as -₹1,95,80,000' },
  { id: 'ZER-1002632', type: 'Negative Price', detail: 'Sale price recorded as -₹1,79,80,000' }
];

const FAKE_LISTINGS = [
  { id: 'MAG-1003492', bhk: 1, loc: 'Electronic City', price: 6250, reality: 'Monthly rental price posted as purchase price' },
  { id: 'ZER-1003813', bhk: 2, loc: 'Sarjapur Road', price: 6550, reality: 'Monthly rental price posted as purchase price' },
  { id: 'DWE-1002631', bhk: 2, loc: 'Indiranagar', price: 6720, reality: 'Monthly rental price posted as purchase price' },
  { id: 'SQU-1001431', bhk: 2, loc: 'Whitefield', price: 7590, reality: 'Monthly rental price posted as purchase price' },
  { id: '100-1002501', bhk: 2, loc: 'HSR Layout', price: 8250, reality: 'Monthly rental price posted as purchase price' },
  { id: 'DWE-1003102', bhk: 2, loc: 'Yelahanka', price: 10540, reality: 'Monthly rental price posted as purchase price' },
  { id: 'SQU-1003524', bhk: 3, loc: 'Bellandur', price: 15450, reality: 'Monthly rental price posted as purchase price' },
  { id: 'ZER-1003652', bhk: 3, loc: 'Koramangala', price: 16790, reality: 'Monthly rental price posted as purchase price' },
];

export const InsightsView: React.FC<InsightsViewProps> = ({ onSelectListing }) => {
  const [auditTab, setAuditTab] = useState<'corrupt' | 'fake' | 'units' | 'projects' | 'api'>('corrupt');

  return (
    <div style={{ padding: '2.5rem 0' }}>
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.25rem 0.75rem', borderRadius: 'var(--radius-full)', background: 'var(--primary-light)', border: '1px solid var(--border-highlight)', color: '#c7d2fe', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.75rem' }}>
            <Sparkles size={14} color="var(--primary)" />
            <span>Market Intelligence & Data Quality Audit</span>
          </div>
          <h1 style={{ fontSize: '2.75rem', marginBottom: '0.5rem' }}>
            Bangalore Real Estate <span className="gradient-text">Insights</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '750px', fontSize: '1rem', lineHeight: 1.6 }}>
            Comprehensive analytics combining pre-computed market metrics with our automated reverse-engineering data quality findings across 4,700 listing records.
          </p>
        </div>

        {/* Top Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Listings</span>
            <h2 style={{ fontSize: '2.25rem', color: '#fff', margin: '0.25rem 0' }}>4,700</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Server reported 4,315 <span style={{ color: 'var(--rose)' }}>(undercount)</span>
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Sale Inventory</span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--emerald)', margin: '0.25rem 0' }}>3,722</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              79.2% live properties (978 inactive)
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>2BHK Mean Rate / SqFt</span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--primary)', margin: '0.25rem 0' }}>₹11,496.64</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Verified across clean live inventory
            </p>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Monthly Rent</span>
            <h2 style={{ fontSize: '2.25rem', color: 'var(--amber)', margin: '0.25rem 0' }}>₹68.51 Lac</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              191 rentals in assigned Indiranagar
            </p>
          </div>
        </div>

        {/* Charts & Distributions */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          {/* Locality Price Table */}
          <div className="glass-card" style={{ padding: '1.75rem' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Building size={18} color="var(--primary)" />
              <span>Median Valuation by Locality</span>
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {LOCALITY_DATA.map(loc => {
                const maxMedian = 20000000;
                const pct = (loc.median / maxMedian) * 100;
                const isAssigned = loc.name === 'indiranagar';

                return (
                  <div key={loc.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                      <span style={{ textTransform: 'capitalize', fontWeight: isAssigned ? 700 : 500, color: isAssigned ? '#fbbf24' : 'var(--text-primary)' }}>
                        {loc.name} {isAssigned && '★'}
                      </span>
                      <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                        {formatPrice(loc.median)} <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(₹{loc.avgSqft}/sqft)</span>
                      </span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%',
                        width: `${pct}%`,
                        background: isAssigned
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #6366f1, #a5b4fc)',
                        borderRadius: 'var(--radius-full)'
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* BHK Distribution */}
          <div className="glass-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="var(--primary)" />
              <span>Inventory Distribution by Configuration</span>
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {BHK_DATA.map(b => (
                <div key={b.bhk} style={{ background: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{b.bhk}</p>
                  <p style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: '0.2rem 0' }}>{b.count}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 600 }}>{b.share}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 'auto', background: 'rgba(255, 255, 255, 0.02)', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <h4 style={{ fontSize: '0.95rem', color: '#fff', marginBottom: '0.4rem' }}>Key Market Takeaway</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                2 BHK and 3 BHK apartments form <strong>74.9%</strong> of the total Bangalore inventory. Premium localities like Indiranagar and Koramangala command a <strong>+45%</strong> pricing premium per square foot compared to the outer IT corridors.
              </p>
            </div>
          </div>
        </div>

        {/* The Core Audit Room */}
        <div className="glass-card" style={{ padding: '2rem', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <ShieldAlert size={28} color="var(--rose)" />
            <div>
              <h2 style={{ fontSize: '1.75rem', color: '#fff' }}>
                Platform Data Integrity & Reverse-Engineering Audit
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Every discrepancy discovered through automated stress-testing against the live API.
              </p>
            </div>
          </div>

          {/* Sub Navigation */}
          <div style={{ display: 'flex', gap: '0.5rem', margin: '1.5rem 0', flexWrap: 'wrap' }}>
            <button
              onClick={() => setAuditTab('corrupt')}
              className={`btn ${auditTab === 'corrupt' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <span>Corrupt Listings (40)</span>
            </button>
            <button
              onClick={() => setAuditTab('fake')}
              className={`btn ${auditTab === 'fake' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <span>Enquiry Bait (8)</span>
            </button>
            <button
              onClick={() => setAuditTab('units')}
              className={`btn ${auditTab === 'units' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <span>Unit Mismatches (389)</span>
            </button>
            <button
              onClick={() => setAuditTab('projects')}
              className={`btn ${auditTab === 'projects' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <span>Desynced Projects (127)</span>
            </button>
            <button
              onClick={() => setAuditTab('api')}
              className={`btn ${auditTab === 'api' ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.85rem' }}
            >
              <span>API Spec Lies (18)</span>
            </button>
          </div>

          {/* Audit Tab Contents */}
          {auditTab === 'corrupt' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Our automated integrity sweep discovered exactly <strong>40 listing records</strong> that violate physical reality. These divide symmetrically into 5 categories with exactly 8 records each:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {SAMPLE_CORRUPT_LISTINGS.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item.id)}
                    className="glass-card"
                    style={{ padding: '1rem', border: '1px solid rgba(244, 63, 94, 0.2)', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{item.id}</span>
                      <span className="badge badge-danger" style={{ fontSize: '0.65rem' }}>{item.type}</span>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: '#fca5a5' }}>{item.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {auditTab === 'fake' && (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                Exactly <strong>8 listings</strong> feature rental rates (₹6,250 to ₹16,790) listed as sale prices to generate buyer enquiries:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1rem' }}>
                {FAKE_LISTINGS.map(item => (
                  <div
                    key={item.id}
                    onClick={() => onSelectListing(item.id)}
                    className="glass-card"
                    style={{ padding: '1rem', border: '1px solid rgba(245, 158, 11, 0.3)', cursor: 'pointer' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{item.id}</span>
                      <span className="badge badge-warning">₹{item.price.toLocaleString('en-IN')}</span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
                      {item.bhk} BHK in {item.loc}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#fde68a' }}>{item.reality}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {auditTab === 'units' && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>The MagicHomes Metric Area Bug</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                While the documentation asserts <em>"Area: Square feet, integer, everywhere in the API"</em>, all <strong>389 listings</strong> from <code>magichomes</code> with carpet area &lt; 300 were recorded in <strong>Square Meters</strong> instead of Square Feet (e.g. 75 sq m = 807 sq ft).
              </p>
              <p style={{ color: 'var(--emerald)', fontSize: '0.85rem', fontWeight: 600 }}>
                ✓ Our frontend automatically detects and normalizes these listings into square feet with a visual badge.
              </p>
            </div>
          )}

          {auditTab === 'projects' && (
            <div style={{ background: 'var(--bg-tertiary)', padding: '1.5rem', borderRadius: 'var(--radius-md)' }}>
              <h4 style={{ fontSize: '1.1rem', color: '#fff', marginBottom: '0.5rem' }}>Project Inventory Desynchronization</h4>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '1rem' }}>
                The documentation promises that <code>total_listings</code> on projects always agrees with available listings. In reality, for <strong>127 projects</strong> out of 520, the count is desynchronized from the actual active listings database.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Example projects: P10003 (reported 7, active 3), P10004 (reported 3, active 7), P10005 (reported 4, active 8).
              </p>
            </div>
          )}

          {auditTab === 'api' && (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem' }}>Endpoint</th>
                    <th style={{ padding: '0.75rem' }}>Category</th>
                    <th style={{ padding: '0.75rem' }}>Documented Claim</th>
                    <th style={{ padding: '0.75rem' }}>Actual Reality</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>*</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>auth</span></td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>?api_key=... in query param</td>
                    <td style={{ padding: '0.75rem', color: 'var(--emerald)' }}>Requires X-API-Key HTTP header</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>/auth/login</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge" style={{ background: 'rgba(99, 102, 241, 0.2)' }}>auth</span></td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>24h token, no refresh flow</td>
                    <td style={{ padding: '0.75rem', color: 'var(--emerald)' }}>900s access token + /auth/refresh</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>/v1/favourites</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge" style={{ background: 'rgba(244, 63, 94, 0.2)' }}>missing_endpoint</span></td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>/v1/favourites with &#123;id: ...&#125;</td>
                    <td style={{ padding: '0.75rem', color: 'var(--emerald)' }}>/v1/saved with &#123;listing_id: ...&#125;</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>/v1/listing/&#123;id&#125;</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge" style={{ background: 'rgba(244, 63, 94, 0.2)' }}>missing_endpoint</span></td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Singular: /v1/listing/&#123;id&#125; (404)</td>
                    <td style={{ padding: '0.75rem', color: 'var(--emerald)' }}>Plural: /v1/listings/&#123;id&#125; (200)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>/v1/analytics/summary</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge" style={{ background: 'rgba(244, 63, 94, 0.2)' }}>missing_endpoint</span></td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Pre-computed aggregate stats</td>
                    <td style={{ padding: '0.75rem', color: 'var(--emerald)' }}>404 Not Found (computed client-side)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '0.75rem', fontWeight: 600, color: '#fff' }}>/v1/projects</td>
                    <td style={{ padding: '0.75rem' }}><span className="badge" style={{ background: 'rgba(245, 158, 11, 0.2)' }}>units</span></td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-muted)' }}>Price in integer Indian rupees</td>
                    <td style={{ padding: '0.75rem', color: 'var(--emerald)' }}>Prices in Crores (Cr) INR (e.g. 1.04 Cr)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
