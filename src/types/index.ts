export interface Listing {
  listing_id: string;
  listing_url: string;
  website: string;
  city_id: number;
  apartment_name: string;
  locality: string;
  property_type: string;
  bedroom: number;
  bathroom: number;
  balcony?: number;
  floor: number;
  total_floors: number;
  furnishing: string;
  facing_direction?: string;
  covered_parking?: number;
  price: number;
  carpet_area: number;
  super_built_up_area?: number;
  latitude: number;
  longitude: number;
  posted_by: string;
  posted_by_name: string;
  posted_by_contact: string;
  project_id?: string | null;
  is_verified?: boolean;
  description: string;
  posted_at: string;
  is_live: boolean;
  // Client normalized fields
  carpet_area_sqft?: number;
  is_unit_converted?: boolean;
  is_corrupt?: boolean;
  corrupt_reason?: string;
  is_fake?: boolean;
}

export interface Rental {
  listing_id: string;
  listing_url: string;
  website: string;
  city_id: number;
  title: string;
  apartment_name: string;
  locality: string;
  property_type: string;
  bedroom: number;
  bathroom: number;
  floor: number;
  total_floors: number;
  furnishing: string;
  facing_direction?: string;
  price: number;
  deposit: number;
  maintenance?: number;
  carpet_area: number;
  super_builtup_area?: number;
  latitude: number;
  longitude: number;
  posted_by: string;
  posted_by_name: string;
  posted_by_contact: string;
  description: string;
  posted_at: string;
  is_live?: boolean;
}

export interface Project {
  project_id: string;
  project_url: string;
  city_id: number;
  apartment_name: string;
  developer_name: string;
  locality: string;
  project_status: string;
  total_units: number;
  total_towers: number;
  total_floors: number;
  launch_date: string;
  possession_date: string;
  rera_number: string;
  min_area_sqft: number;
  max_area_sqft: number;
  amenities: string[];
  latitude: number;
  longitude: number;
  total_listings: number;
  price_min: number; // in Crores
  price_max: number; // in Crores
  // Client calculated
  actual_live_listings?: number;
  is_count_desynced?: boolean;
}

export interface User {
  email: string;
  name?: string;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  expires_at: number; // timestamp ms
  user: User;
}

export interface FilterState {
  locality: string;
  bhk: string;
  property_type: string;
  min_price: string;
  max_price: string;
  furnishing: string;
  only_live: boolean;
  search: string;
  sort_by: string;
  order: 'asc' | 'desc';
}
