
export interface RiskFactor {
  level: 'low' | 'medium' | 'high';
  score: number;
  factors?: string[];
  description?: string;
}

export interface RiskAssessment {
  market_risk?: RiskFactor;
  financial_risk?: RiskFactor;
  property_risk?: RiskFactor;
  renovation_risk?: RiskFactor;
  location_risk?: RiskFactor;
  overall_risk_level?: 'low' | 'medium' | 'high';
  overall_risk_score?: number;
  confidence_level?: number;
  recommendations?: string[];
  key_risks?: string[];
  mitigation_strategies?: string[];
}

export interface MarketAnalysis {
  estimated_arv?: number;
  market_trend?: 'increasing' | 'stable' | 'declining';
  avg_days_on_market?: number;
  price_per_sqm?: number;
  market_confidence?: number;
  rental_yield?: number;
  insights?: string;
  location_score?: number;
}

export interface RenovationRoom {
  cost: number;
  description: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface RenovationItem {
  id: string;
  description: string;
  cost: number;
  priority?: 'high' | 'medium' | 'low';
}

export interface RenovationAnalysis {
  total_cost?: number;
  timeline_weeks?: number;
  timeline?: number;
  kitchen?: RenovationRoom;
  bathrooms?: RenovationRoom;
  flooring?: RenovationRoom;
  painting?: RenovationRoom;
  electrical?: RenovationRoom;
  plumbing?: RenovationRoom;
  exterior?: RenovationRoom;
  landscaping?: RenovationRoom;
  confidence_level?: number;
  recommendations?: string[];
  breakdown?: RenovationItem[];
  complexity?: 'low' | 'medium' | 'high';
}

export interface ComparableSale {
  address?: string;
  sold_price?: number;
  sold_date?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area?: number;
  land_area?: number;
  property_type?: string;
  days_on_market?: number;
  listing_url?: string;
}

// Add alias for backward compatibility
export interface Comparable extends ComparableSale {}

export interface MarketData {
  comparables?: ComparableSale[];
  analysis?: MarketAnalysis;
  investment_metrics?: {
    max_purchase_price?: number;
    estimated_renovation_cost?: number;
    projected_profit?: number;
    roi_percentage?: number;
  };
}

export interface ListingDetails {
  title?: string;
  method?: string;
  type?: string;
  parking?: string;
  internet?: string;
  other_features?: string;
  date?: string;
}

export interface Deal {
  id: string;
  property_id: string;
  pipeline_stage: 'Analysis' | 'Offer' | 'Under Contract' | 'Reno' | 'Listed' | 'Sold';
  current_profit: number;
  current_risk: 'low' | 'medium' | 'high';
  notes: string;
  purchase_price: number;
  target_sale_price: number;
  estimated_renovation_cost?: number;
  created_at: string;
  updated_at: string;
  user_id: string;
  team_id?: string;
  market_analysis?: MarketData;
  renovation_analysis?: RenovationAnalysis;
  risk_assessment?: RiskAssessment;
  analysis_data?: any;
  listing_details?: ListingDetails;
  // Property data from unified_properties (joined)
  property?: {
    address: string;
    suburb: string;
    city: string;
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    land_area?: number;
    photos?: string[];
    description?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  // Flattened property fields for backward compatibility
  address?: string;
  suburb?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area?: number;
  land_area?: number;
  photos?: string[];
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}
