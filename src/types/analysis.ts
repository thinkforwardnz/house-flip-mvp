
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
}

export interface RenovationRoom {
  cost: number;
  description: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface RenovationAnalysis {
  total_cost?: number;
  timeline_weeks?: number;
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

export interface Deal {
  id: string;
  address: string;
  suburb?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor_area?: number;
  land_area?: number;
  purchase_price?: number;
  target_sale_price?: number;
  current_profit?: number;
  current_risk?: 'low' | 'medium' | 'high';
  photos?: string[];
  coordinates?: any;
  description?: string;
  market_analysis?: MarketData;
  renovation_analysis?: RenovationAnalysis;
  risk_assessment?: RiskAssessment;
  analysis_data?: any;
}
