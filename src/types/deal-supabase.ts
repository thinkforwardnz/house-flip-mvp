
import type { Deal } from '@/types/analysis';

// Represents the structure of data within the 'unified_properties' table or join.
export interface SupabasePropertyData {
  address: string;
  suburb: string | null;
  city: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;
  land_area: number | null;
  photos: string[] | null;
  description: string | null;
  coordinates: { x: number; y: number } | any | null; // Supabase point type or {x,y} from GeoJSON
}

// Represents a raw record directly from the 'deals' table in Supabase.
// It should include all columns present in the 'deals' table.
export interface RawDealFromSupabase {
  id: string;
  property_id: string;
  user_id: string;
  team_id?: string | null;
  pipeline_stage: 'Analysis' | 'Offer' | 'Under Contract' | 'Reno' | 'Listed' | 'Sold';
  current_profit: number;
  current_risk: 'low' | 'medium' | 'high';
  notes: string;
  purchase_price: number;
  target_sale_price: number;
  estimated_renovation_cost?: number | null;
  created_at: string;
  updated_at: string;
  market_analysis?: any; // JSONB
  renovation_analysis?: any; // JSONB
  risk_assessment?: any; // JSONB
  analysis_data?: any; // JSONB
  listing_details?: any; // JSONB
  renovation_selections?: any; // JSONB
}

// Represents a deal record as fetched from Supabase when joined with 'unified_properties'.
export interface DealWithNestedProperty extends RawDealFromSupabase {
  unified_properties: SupabasePropertyData | null;
}

