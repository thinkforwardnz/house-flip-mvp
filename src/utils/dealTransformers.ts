
import type { Deal } from '@/types/analysis';
import type { DealWithNestedProperty, SupabasePropertyData } from '@/types/deal-supabase';

function transformPropertyDataToDealProperty(propertyData: SupabasePropertyData | null): Deal['property'] {
  if (!propertyData) return undefined;

  let coordinates;
  if (propertyData.coordinates && typeof propertyData.coordinates === 'object') {
    // Check for Supabase point type {x, y} which often comes from PostGIS ST_AsGeoJSON -> properties
    // Or if it's already in {lat, lng} format from some other transformation.
    // The original code checked for 'x' and 'y'.
    if ('x' in propertyData.coordinates && 'y' in propertyData.coordinates &&
        typeof (propertyData.coordinates as any).x === 'number' &&
        typeof (propertyData.coordinates as any).y === 'number') {
      coordinates = { lat: (propertyData.coordinates as any).y, lng: (propertyData.coordinates as any).x };
    }
    // If coordinates might already be {lat, lng}, add a check here too.
    // For now, assuming 'x' and 'y' is the primary structure from DB.
  }

  return {
    address: propertyData.address,
    suburb: propertyData.suburb || '',
    city: propertyData.city || 'Auckland', // Default city
    bedrooms: propertyData.bedrooms ?? undefined,
    bathrooms: propertyData.bathrooms ?? undefined,
    floor_area: propertyData.floor_area ?? undefined,
    land_area: propertyData.land_area ?? undefined,
    photos: propertyData.photos ?? undefined,
    description: propertyData.description ?? undefined,
    coordinates: coordinates,
  };
}

export const transformSupabaseDeal = (supabaseDeal: DealWithNestedProperty): Deal => {
  const transformedProperty = transformPropertyDataToDealProperty(supabaseDeal.unified_properties);

  return {
    // Spread all fields from RawDealFromSupabase that are part of the Deal type
    id: supabaseDeal.id,
    property_id: supabaseDeal.property_id,
    user_id: supabaseDeal.user_id,
    team_id: supabaseDeal.team_id ?? undefined,
    pipeline_stage: supabaseDeal.pipeline_stage,
    current_profit: supabaseDeal.current_profit,
    current_risk: supabaseDeal.current_risk,
    notes: supabaseDeal.notes,
    purchase_price: supabaseDeal.purchase_price,
    target_sale_price: supabaseDeal.target_sale_price,
    estimated_renovation_cost: supabaseDeal.estimated_renovation_cost ?? undefined,
    created_at: supabaseDeal.created_at,
    updated_at: supabaseDeal.updated_at,
    market_analysis: supabaseDeal.market_analysis,
    renovation_analysis: supabaseDeal.renovation_analysis,
    risk_assessment: supabaseDeal.risk_assessment,
    analysis_data: supabaseDeal.analysis_data,
    listing_details: supabaseDeal.listing_details,
    renovation_selections: supabaseDeal.renovation_selections,

    // The nested 'property' object
    property: transformedProperty,

    // Flattened property fields, derived from 'transformedProperty' for consistency and to match Deal type
    address: transformedProperty?.address,
    suburb: transformedProperty?.suburb,
    city: transformedProperty?.city,
    bedrooms: transformedProperty?.bedrooms,
    bathrooms: transformedProperty?.bathrooms,
    floor_area: transformedProperty?.floor_area,
    land_area: transformedProperty?.land_area,
    photos: transformedProperty?.photos,
    description: transformedProperty?.description,
    coordinates: transformedProperty?.coordinates,
  };
};

