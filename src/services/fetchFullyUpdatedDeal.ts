
import { supabase } from '@/integrations/supabase/client';
import type { Deal, MarketData, RenovationAnalysis, RiskAssessment, ListingDetails } from '@/types/analysis';

export const fetchFullyUpdatedDeal = async (dealId: string): Promise<Partial<Deal>> => {
  console.log('Fetching fully updated deal data for deal ID:', dealId);
  const { data: fetchedDealData, error: fetchError } = await supabase
    .from('deals')
    .select(`
      *,
      property:unified_properties (
        address,
        suburb,
        city,
        bedrooms,
        bathrooms,
        floor_area,
        land_area,
        photos,
        description,
        coordinates
      )
    `)
    .eq('id', dealId)
    .single();

  if (fetchError) {
    console.error('Error fetching final updated deal:', fetchError);
    throw new Error(`Could not fetch the very latest deal data after analysis: ${fetchError.message}`);
  }
  
  if (!fetchedDealData) {
    throw new Error('No deal data returned after fetching.');
  }

  const { property: rawPropertyFromDb, ...dealFieldsOnly } = fetchedDealData;

  let transformedCoords: { lat: number; lng: number } | undefined = undefined;
  if (rawPropertyFromDb?.coordinates &&
      typeof rawPropertyFromDb.coordinates === 'object' &&
      rawPropertyFromDb.coordinates !== null &&
      'x' in rawPropertyFromDb.coordinates && typeof (rawPropertyFromDb.coordinates as any).x === 'number' &&
      'y' in rawPropertyFromDb.coordinates && typeof (rawPropertyFromDb.coordinates as any).y === 'number') {
    transformedCoords = {
      lat: (rawPropertyFromDb.coordinates as any).y,
      lng: (rawPropertyFromDb.coordinates as any).x,
    };
  }

  const propertyForDeal: Deal['property'] = rawPropertyFromDb ? {
    address: rawPropertyFromDb.address,
    suburb: rawPropertyFromDb.suburb ?? '',
    city: rawPropertyFromDb.city ?? 'Auckland',
    bedrooms: rawPropertyFromDb.bedrooms ?? undefined,
    bathrooms: rawPropertyFromDb.bathrooms ?? undefined,
    floor_area: rawPropertyFromDb.floor_area ?? undefined,
    land_area: rawPropertyFromDb.land_area ?? undefined,
    photos: rawPropertyFromDb.photos ?? undefined,
    description: rawPropertyFromDb.description ?? undefined,
    coordinates: transformedCoords,
  } : undefined;
  
  const dealForUpdate: Partial<Deal> = {
    ...dealFieldsOnly,
    market_analysis: dealFieldsOnly.market_analysis as MarketData | undefined,
    renovation_analysis: dealFieldsOnly.renovation_analysis as RenovationAnalysis | undefined,
    risk_assessment: dealFieldsOnly.risk_assessment as RiskAssessment | undefined,
    listing_details: dealFieldsOnly.listing_details as ListingDetails | undefined,
    property: propertyForDeal,
    address: rawPropertyFromDb?.address ?? undefined,
    suburb: rawPropertyFromDb?.suburb ?? undefined,
    city: rawPropertyFromDb?.city ?? undefined,
    bedrooms: rawPropertyFromDb?.bedrooms ?? undefined,
    bathrooms: rawPropertyFromDb?.bathrooms ?? undefined,
    floor_area: rawPropertyFromDb?.floor_area ?? undefined,
    land_area: rawPropertyFromDb?.land_area ?? undefined,
    photos: rawPropertyFromDb?.photos ?? undefined,
    description: rawPropertyFromDb?.description ?? undefined,
    coordinates: transformedCoords,
  };
  console.log('Transformed deal for update:', dealForUpdate);
  return dealForUpdate;
};
