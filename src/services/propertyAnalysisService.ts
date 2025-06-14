
import { supabase } from '@/integrations/supabase/client';
import type { Deal, MarketData, RenovationAnalysis, RiskAssessment, ListingDetails } from '@/types/analysis';

interface MarketAnalysisParams {
  dealId: string;
  address?: string;
  suburb?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
}

export const invokeMarketAnalysis = async (params: MarketAnalysisParams): Promise<Partial<Deal>> => {
  console.log('Starting market analysis for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('market-analysis', {
    body: {
      dealId: params.dealId,
      address: params.address,
      suburb: params.suburb,
      city: params.city,
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
    },
  });

  if (error) {
    console.error('Market analysis error:', error);
    throw new Error(`Market analysis failed: ${error.message}`);
  }
  console.log('Market analysis response:', data);
  if (data && data.updatedFields) {
    const partialUpdates = { ...data.updatedFields };
    if (partialUpdates.market_analysis) {
      partialUpdates.market_analysis = partialUpdates.market_analysis as MarketData | undefined;
    }
    return partialUpdates;
  }
  return {};
};

interface PropertyEnrichmentParams {
  dealId: string;
  address?: string;
  coordinates?: { lat: number; lng: number };
}

export const invokePropertyEnrichment = async (params: PropertyEnrichmentParams): Promise<Partial<Deal>> => {
  console.log('Starting property enrichment for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('enrich-property-analysis', {
    body: {
      dealId: params.dealId,
      address: params.address,
      coordinates: params.coordinates,
    },
  });

  if (error) {
    // Non-critical, so log and continue
    console.error('Property enrichment error:', error.message);
    return {}; // Return empty if error, as per original logic allowing this step to fail softly
  }
  console.log('Property enrichment response:', data);
  if (data && data.data) {
    return data.data as Partial<Deal>;
  }
  return {};
};

interface RenovationAnalysisParams {
  dealId: string;
  photos?: string[];
  propertyDescription?: string;
  bedrooms?: number;
  bathrooms?: number;
  floorArea?: number;
}

export const invokeRenovationAnalysis = async (params: RenovationAnalysisParams): Promise<Partial<Deal>> => {
  console.log('Starting renovation analysis for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('renovation-analysis', {
    body: {
      dealId: params.dealId,
      photos: params.photos || [],
      propertyDescription: params.propertyDescription || '',
      bedrooms: params.bedrooms,
      bathrooms: params.bathrooms,
      floorArea: params.floorArea,
    },
  });

  if (error) {
    console.error('Renovation analysis error:', error);
    throw new Error(`Renovation analysis failed: ${error.message}`);
  }
  console.log('Renovation analysis response:', data);
  if (data && data.updatedFields) {
    const partialUpdates = { ...data.updatedFields };
    if (partialUpdates.renovation_analysis) {
      partialUpdates.renovation_analysis = partialUpdates.renovation_analysis as RenovationAnalysis | undefined;
    }
    return partialUpdates;
  }
  return {};
};

interface RiskAssessmentParams {
  dealId: string;
}

export const invokeRiskAssessment = async (params: RiskAssessmentParams): Promise<Partial<Deal>> => {
  console.log('Starting risk assessment for deal:', params.dealId);
  const { data, error } = await supabase.functions.invoke('risk-assessment', {
    body: { dealId: params.dealId },
  });

  if (error) {
    console.error('Risk assessment error:', error);
    throw new Error(`Risk assessment failed: ${error.message}`);
  }
  console.log('Risk assessment response:', data);
  if (data && data.updatedFields) {
    const partialUpdates = { ...data.updatedFields };
    if (partialUpdates.risk_assessment) {
      partialUpdates.risk_assessment = partialUpdates.risk_assessment as RiskAssessment | undefined;
    }
    return partialUpdates;
  }
  return {};
};

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
    // This function will throw, letting the caller (hook) handle the toast.
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

