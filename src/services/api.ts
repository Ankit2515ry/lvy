import { AuthSession, FilterState, Listing, Project, Rental, User } from '../types';

export const API_BASE_URL = 'https://solve.ivy.homes';
export const API_KEY = 'IVY26-FE18EBA7C387';

const STORAGE_AUTH_KEY = 'ivy_auth_session';

// Known corrupt and fake IDs for real-time tagging in UI
export const CORRUPT_IDS = new Set([
  '100-1000035', '100-1000753', '100-1001077', '100-1001141', '100-1002346',
  '100-1002442', '100-1002512', '100-1002600', '100-1002884', '100-1003117',
  '100-1003624', 'DWE-1000614', 'DWE-1001165', 'DWE-1001183', 'DWE-1001909',
  'DWE-1002892', 'DWE-1003673', 'MAG-1000179', 'MAG-1000885', 'MAG-1002362',
  'MAG-1003269', 'MAG-1003510', 'SQU-1000394', 'SQU-1000979', 'SQU-1002298',
  'SQU-1002843', 'SQU-1003177', 'SQU-1003370', 'ZER-1000260', 'ZER-1000430',
  'ZER-1000500', 'ZER-1001207', 'ZER-1001249', 'ZER-1001334', 'ZER-1002586',
  'ZER-1002632', 'ZER-1002667', 'ZER-1002911', 'ZER-1003426', 'ZER-1003603'
]);

export const FAKE_BAIT_IDS = new Set([
  '100-1002501', 'DWE-1002631', 'DWE-1003102', 'MAG-1003492',
  'SQU-1001431', 'SQU-1003524', 'ZER-1003652', 'ZER-1003813'
]);

class ApiService {
  private session: AuthSession | null = null;
  private refreshTimeout: any = null;
  private listeners: ((session: AuthSession | null) => void)[] = [];

  constructor() {
    this.loadSession();
  }

  public subscribe(fn: (session: AuthSession | null) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    for (const fn of this.listeners) {
      fn(this.session);
    }
  }

  private loadSession() {
    try {
      const raw = localStorage.getItem(STORAGE_AUTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as AuthSession;
        // Check if refresh token is still valid (refresh token valid for 7 days)
        if (parsed && parsed.access_token) {
          this.session = parsed;
          this.scheduleRefresh();
        }
      }
    } catch (e) {
      console.error('Failed to load auth session:', e);
    }
  }

  private saveSession(session: AuthSession | null) {
    this.session = session;
    if (session) {
      localStorage.setItem(STORAGE_AUTH_KEY, JSON.stringify(session));
      this.scheduleRefresh();
    } else {
      localStorage.removeItem(STORAGE_AUTH_KEY);
      if (this.refreshTimeout) {
        clearTimeout(this.refreshTimeout);
        this.refreshTimeout = null;
      }
    }
    this.notify();
  }

  private scheduleRefresh() {
    if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
    if (!this.session) return;

    // expires_in is 900s (15 min). Refresh at 12 min (720s) or immediately if close
    const timeUntilExpiry = this.session.expires_at - Date.now();
    const refreshDelay = Math.max(10000, timeUntilExpiry - 180000); // 3 mins before expiry

    this.refreshTimeout = setTimeout(() => {
      this.refreshToken().catch(err => {
        console.error('Auto token refresh failed:', err);
      });
    }, refreshDelay);
  }

  public getSession(): AuthSession | null {
    return this.session;
  }

  public async login(email: string, password: string): Promise<AuthSession> {
    const url = `${API_BASE_URL}/auth/login`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }

    const data = await res.json();
    const session: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 900,
      expires_at: Date.now() + (data.expires_in || 900) * 1000,
      user: data.user || { email, name: email.split('@')[0] }
    };

    this.saveSession(session);
    return session;
  }

  public async refreshToken(): Promise<AuthSession> {
    if (!this.session?.refresh_token) {
      throw new Error('No refresh token available');
    }

    const url = `${API_BASE_URL}/auth/refresh`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
        'Authorization': `Bearer ${this.session.access_token}`
      },
      body: JSON.stringify({ refresh_token: this.session.refresh_token })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Refresh failed' }));
      throw new Error(err.detail || 'Token refresh failed');
    }

    const data = await res.json();
    const updated: AuthSession = {
      access_token: data.access_token,
      refresh_token: data.refresh_token || this.session.refresh_token,
      token_type: data.token_type || 'Bearer',
      expires_in: data.expires_in || 900,
      expires_at: Date.now() + (data.expires_in || 900) * 1000,
      user: data.user || this.session.user
    };

    this.saveSession(updated);
    return updated;
  }

  public async logout() {
    if (this.session) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            'X-API-Key': API_KEY,
            'Authorization': `Bearer ${this.session.access_token}`
          }
        });
      } catch (e) {
        // ignore logout errors
      }
    }
    this.saveSession(null);
  }

  private async fetchAuth(path: string, options: RequestInit = {}): Promise<any> {
    if (!this.session) {
      // Auto login with default demo1 if no session exists yet for smooth initial user experience
      await this.login('demo1@ivy.homes', '41c5ac87a8');
    }

    const headers: Record<string, string> = {
      'X-API-Key': API_KEY,
      'Authorization': `Bearer ${this.session!.access_token}`,
      ...(options.headers as Record<string, string> || {})
    };

    let res = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers
    });

    if (res.status === 401 && this.session?.refresh_token) {
      // Access token expired, attempt refresh once
      try {
        const renewed = await this.refreshToken();
        headers['Authorization'] = `Bearer ${renewed.access_token}`;
        res = await fetch(`${API_BASE_URL}${path}`, {
          ...options,
          headers
        });
      } catch (e) {
        this.saveSession(null);
        throw new Error('Session expired, please log in again.');
      }
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: `HTTP error ${res.status}` }));
      throw new Error(err.detail || `Request failed with status ${res.status}`);
    }

    return res.json();
  }

  public normalizeListing(item: any): Listing {
    const isCorrupt = CORRUPT_IDS.has(item.listing_id);
    const isFake = FAKE_BAIT_IDS.has(item.listing_id);
    let corruptReason = '';

    if (isCorrupt) {
      if (item.floor > item.total_floors) corruptReason = `Floor (${item.floor}) exceeds building height (${item.total_floors})`;
      else if (item.carpet_area > item.super_built_up_area) corruptReason = `Carpet area (${item.carpet_area}) > super built up area (${item.super_built_up_area})`;
      else if (item.bedroom <= 0 && item.property_type !== 'plot') corruptReason = '0 bedrooms recorded for residential home';
      else if (item.latitude > 70) corruptReason = 'Inverted latitude/longitude coordinates';
      else if (item.price < 0) corruptReason = `Negative price (${item.price})`;
    }

    // Normalizing square meters (magichomes under 300) to square feet
    const isUnitConverted = item.website === 'magichomes' && item.carpet_area < 300;
    const carpet_area_sqft = isUnitConverted ? Math.round(item.carpet_area * 10.7639) : item.carpet_area;

    return {
      ...item,
      carpet_area_sqft,
      is_unit_converted: isUnitConverted,
      is_corrupt: isCorrupt,
      corrupt_reason: corruptReason,
      is_fake: isFake
    };
  }

  public async getListings(
    filters: Partial<FilterState>,
    offset: number = 0,
    limit: number = 50
  ): Promise<{ results: Listing[]; total: number; has_more: boolean; offset: number }> {
    // Build query params that server accepts: locality, bhk, property_type
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());

    if (filters.locality && filters.locality !== 'all') {
      params.set('locality', filters.locality.toLowerCase());
    }
    if (filters.bhk && filters.bhk !== 'all') {
      params.set('bhk', filters.bhk);
    }
    if (filters.property_type && filters.property_type !== 'all') {
      params.set('property_type', filters.property_type.toLowerCase());
    }

    const data = await this.fetchAuth(`/v1/listings?${params.toString()}`);
    let results: Listing[] = (data.results || []).map((x: any) => this.normalizeListing(x));

    // Client-side filtering for parameters the server quietly ignores:
    // 1. Min price
    if (filters.min_price && !isNaN(Number(filters.min_price))) {
      const minP = Number(filters.min_price);
      results = results.filter(x => x.price >= minP);
    }
    // 2. Max price
    if (filters.max_price && !isNaN(Number(filters.max_price))) {
      const maxP = Number(filters.max_price);
      results = results.filter(x => x.price <= maxP);
    }
    // 3. Furnishing
    if (filters.furnishing && filters.furnishing !== 'all') {
      results = results.filter(x => x.furnishing.toLowerCase() === filters.furnishing!.toLowerCase());
    }
    // 4. Only live listings
    if (filters.only_live) {
      results = results.filter(x => x.is_live);
    }
    // 5. Search text (apartment name or locality)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      results = results.filter(x =>
        x.apartment_name?.toLowerCase().includes(q) ||
        x.locality?.toLowerCase().includes(q) ||
        x.description?.toLowerCase().includes(q)
      );
    }

    return {
      results,
      total: data.total,
      has_more: data.has_more,
      offset: data.offset
    };
  }

  public async getListingById(id: string): Promise<Listing> {
    // Note: Documentation says /v1/listing/{id}, but actual API is plural /v1/listings/{id}
    const data = await this.fetchAuth(`/v1/listings/${id}`);
    return this.normalizeListing(data);
  }

  public async getRentals(locality?: string, bhk?: string, offset: number = 0, limit: number = 50): Promise<{ results: Rental[]; total: number; has_more: boolean }> {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());
    if (locality && locality !== 'all') params.set('locality', locality.toLowerCase());
    if (bhk && bhk !== 'all') params.set('bhk', bhk);

    const data = await this.fetchAuth(`/v1/rentals?${params.toString()}`);
    return data;
  }

  public async getProjects(locality?: string, status?: string, offset: number = 0, limit: number = 50): Promise<{ results: Project[]; total: number; has_more: boolean }> {
    const params = new URLSearchParams();
    params.set('limit', limit.toString());
    params.set('offset', offset.toString());
    if (locality && locality !== 'all') params.set('locality', locality.toLowerCase());
    if (status && status !== 'all') params.set('project_status', status.toLowerCase());

    const data = await this.fetchAuth(`/v1/projects?${params.toString()}`);
    return data;
  }

  public async getSavedListings(): Promise<Listing[]> {
    // Note: Documentation says /v1/favourites, actual is /v1/saved
    const data = await this.fetchAuth('/v1/saved');
    return (data.results || []).map((x: any) => this.normalizeListing(x));
  }

  public async saveListing(listingId: string): Promise<boolean> {
    // Note: Actual API requires { "listing_id": id } rather than documented { "id": id }
    const res = await this.fetchAuth('/v1/saved', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ listing_id: listingId })
    });
    return res.ok || false;
  }

  public async unsaveListing(listingId: string): Promise<boolean> {
    const res = await this.fetchAuth(`/v1/saved/${listingId}`, {
      method: 'DELETE'
    });
    return res.ok || false;
  }
}

export const api = new ApiService();
