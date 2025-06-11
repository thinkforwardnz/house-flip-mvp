
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { Property, EnhancedData, PropertySchema, EnhancedDataSchema } from './types.ts';
import { ScraperService } from './scraper-service.ts';

export class PropertyEnricher {
  private supabase: SupabaseClient;
  private scraperService: ScraperService;

  constructor() {
    this.supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    this.scraperService = new ScraperService();
  }

  async getPropertiesToEnrich(): Promise<Property[]> {
    const { data: propertiesToEnrich, error: queryError } = await this.supabase
      .from('unified_properties')
      .select('id, source_url, address, photos, description, bedrooms, bathrooms, floor_area, land_area')
      .contains('tags', ['prospecting'])
      .or('photos.is.null,photos.eq.{},description.is.null,bedrooms.is.null,bathrooms.is.null,floor_area.is.null')
      .limit(15);

    if (queryError) {
      throw new Error(`Failed to query properties: ${queryError.message}`);
    }

    return propertiesToEnrich || [];
  }

  async enrichProperty(property: Property): Promise<{ success: boolean; hasUpdates: boolean; error?: string }> {
    // Validate property before enrichment
    const propertyParse = PropertySchema.safeParse(property);
    if (!propertyParse.success) {
      console.error('Invalid property to enrich:', propertyParse.error);
      return { success: false, hasUpdates: false, error: 'Invalid property data' };
    }
    const validatedProperty = propertyParse.data;

    try {
      console.log(`Enriching property: ${validatedProperty.address} (${validatedProperty.source_url})`);
      const enhancedDataRaw = await this.scraperService.scrapePropertyData(validatedProperty.source_url);
      
      if (!enhancedDataRaw) {
        console.log(`No enhanced data found for: ${validatedProperty.address}`);
        return { success: true, hasUpdates: false };
      }
      
      // Validate enhanced data
      const enhancedDataParse = EnhancedDataSchema.safeParse(enhancedDataRaw);
      if (!enhancedDataParse.success) {
        console.error('Invalid enhanced data:', enhancedDataParse.error);
        return { success: false, hasUpdates: false, error: 'Invalid enhanced data' };
      }
      const enhancedData = enhancedDataParse.data;
      
      const updateData: Partial<typeof validatedProperty> & { updated_at: string } = {
        updated_at: new Date().toISOString()
      };
      
      if (enhancedData.photos && enhancedData.photos.length > 0) {
        updateData.photos = enhancedData.photos;
      }
      if (enhancedData.description && !validatedProperty.description) {
        updateData.description = enhancedData.description;
      }
      if (enhancedData.bedrooms && !validatedProperty.bedrooms) {
        updateData.bedrooms = enhancedData.bedrooms;
      }
      if (enhancedData.bathrooms && !validatedProperty.bathrooms) {
        updateData.bathrooms = enhancedData.bathrooms;
      }
      if (enhancedData.floor_area && !validatedProperty.floor_area) {
        updateData.floor_area = enhancedData.floor_area;
      }
      if (enhancedData.land_area && !validatedProperty.land_area) {
        updateData.land_area = enhancedData.land_area;
      }
      
      const hasUpdates = Object.keys(updateData).length > 1;
      if (!hasUpdates) {
        console.log(`No meaningful updates found for: ${validatedProperty.address}`);
        return { success: true, hasUpdates: false };
      }
      
      const { error: updateError } = await this.supabase
        .from('unified_properties')
        .update(updateData)
        .eq('id', validatedProperty.id);
      
      if (updateError) {
        console.error('Error updating property:', updateError);
        throw updateError;
      }

      console.log(`Successfully enriched property: ${validatedProperty.address}`);
      return { success: true, hasUpdates: true };
    } catch (error: unknown) {
      console.error('Error enriching property:', error);
      const message = error instanceof Error ? error.message : String(error);
      return { success: false, hasUpdates: false, error: message };
    }
  }
}
