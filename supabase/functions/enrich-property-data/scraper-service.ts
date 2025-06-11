
import { CustomScraperClient } from '../shared/custom-scraper-client.ts';
import { EnhancedData } from './types.ts';

export class ScraperService {
  private scraperClient: CustomScraperClient;

  constructor() {
    this.scraperClient = new CustomScraperClient();
  }

  static validateConfiguration(): { success: boolean; error?: string; message?: string } {
    const customScraperUrl = Deno.env.get('CUSTOM_SCRAPER_BASE_URL');
    console.log('Custom Scraper URL check:', {
      exists: !!customScraperUrl,
      url: customScraperUrl || 'N/A'
    });

    if (!customScraperUrl) {
      console.error('CUSTOM_SCRAPER_BASE_URL not configured in environment');
      return {
        success: false,
        error: 'Custom Scraper URL not configured',
        message: 'Please add your Custom Scraper base URL to Supabase Edge Function secrets'
      };
    }

    return { success: true };
  }

  async scrapePropertyData(sourceUrl: string): Promise<EnhancedData | null> {
    try {
      const propertyDataResponse = await this.scraperClient.scrapeProperty(sourceUrl);
      
      if (!propertyDataResponse || !propertyDataResponse.structured) {
        return null;
      }

      const structured = propertyDataResponse.structured;
      return {
        photos: structured.images || [],
        description: structured.description,
        bedrooms: structured.bedrooms ? parseInt(structured.bedrooms) : undefined,
        bathrooms: structured.bathrooms ? parseInt(structured.bathrooms) : undefined,
        floor_area: structured.floor_area ? parseFloat(structured.floor_area) : undefined,
        land_area: structured.land_area ? parseFloat(structured.land_area) : undefined,
      };
    } catch (error) {
      console.error('Error scraping property data:', error);
      throw error;
    }
  }
}
