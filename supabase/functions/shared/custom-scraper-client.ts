
export interface CustomScraperProperty {
  id: string;
  url: string;
  title: string;
  address: string;
  price: string;
  main_img: string;
  property_features: Array<{
    label: string;
    value: string;
  }>;
  rawText?: string;
  rawHTML?: string;
}

export interface FullPropertyResponse {
  structured: {
    id: string;
    listing_date: string;
    title: string;
    price: string;
    address: string;
    property_type: string;
    bedrooms: string;
    bathrooms: string;
    living_area: string;
    floor_area: string;
    land_area: string;
    other_features: string[];
    parking: string;
    broadband: string;
    description: string;
    rawText?: string;
    images: string[];
    video_url?: string;
    property_estimates: {
      homes_estimate: string;
      homes_estimate_min: string;
      homes_estimate_max: string;
      rent_estimate: string;
      rent_estimate_min: string;
      rent_estimate_max: string;
      rental_yield: string;
    };
    capital_values: {
      total_capital_value: string;
      land_value: string;
      improvement_value: string;
    };
    market_trends: {
      this_home_range: string;
      suburb_median: string;
    };
    property_features: {
      bedrooms: number;
      bathrooms: number;
      area: string;
      property_type: string;
    };
    nearby_sales: Array<{
      listing_url: string;
      image_url?: string;
      sold_date: string;
      address: string;
      bedrooms: string;
      bathrooms: string;
      sold_price: string;
    }>;
  };
}

export class CustomScraperClient {
  private currentEndpoint: string | null = null;
  private fallbackUrls: string[];

  constructor() {
    // Initialize with fallback URLs only
    this.fallbackUrls = [
      'https://4419-222-154-21-216.ngrok-free.app',
      'https://e104-222-154-21-216.ngrok-free.app',
    ];
  }

  private async getCurrentEndpoint(): Promise<string> {
    // If we already loaded the endpoint in this session, use it
    if (this.currentEndpoint) {
      return this.currentEndpoint;
    }

    try {
      console.log('Loading current endpoint from database...');
      
      // Get the current endpoint from the get-scraper-config function
      const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/get-scraper-config`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        const endpoint = data.endpoint;
        console.log(`✅ Loaded endpoint from database: ${endpoint}`);
        
        // Cache the endpoint for this session
        this.currentEndpoint = endpoint;
        
        return endpoint;
      } else {
        console.warn('❌ Failed to load endpoint from database, using fallback');
        throw new Error('Failed to load from database');
      }
    } catch (error) {
      console.error('❌ Error loading endpoint from database:', error);
      
      // Fall back to first fallback URL
      const fallback = this.fallbackUrls[0];
      console.log(`Using fallback endpoint: ${fallback}`);
      return fallback;
    }
  }

  async scrapeSearchResults(searchUrl: string): Promise<{ data: { properties: CustomScraperProperty[] } }> {
    console.log('=== CUSTOM SCRAPER CLIENT ===');
    
    // Get the current endpoint (this will load from database if needed)
    const primaryEndpoint = await this.getCurrentEndpoint();
    console.log(`🎯 Using scraper endpoint: ${primaryEndpoint}`);
    console.log(`Search URL to scrape: ${searchUrl}`);
    
    // Validate the search URL first
    try {
      new URL(searchUrl);
    } catch (error) {
      throw new Error(`Invalid search URL provided: ${searchUrl}`);
    }

    // Try primary endpoint first, then fallbacks
    const urlsToTry = [primaryEndpoint, ...this.fallbackUrls.filter(url => url !== primaryEndpoint)];
    let lastError: Error | null = null;

    for (let i = 0; i < urlsToTry.length; i++) {
      const scraperUrl = urlsToTry[i];
      console.log(`🔄 Attempting scraper ${i + 1}/${urlsToTry.length}: ${scraperUrl}`);
      
      try {
        const endpoint = `${scraperUrl}/scrape-search-results`;
        console.log(`📡 Making request to: ${endpoint}`);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            url: searchUrl,
            backend: 'playwright'
          }),
        });

        console.log(`📊 Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('📥 Response received, parsing...');
        console.log(`Data type: ${typeof data}`);
        console.log(`Is array: ${Array.isArray(data)}`);
        
        // Handle different response formats
        if (Array.isArray(data)) {
          console.log(`✅ Scraper ${i + 1} success: Found ${data.length} properties (direct array)`);
          return {
            data: {
              properties: data
            }
          };
        } else if (data && data.results && Array.isArray(data.results)) {
          console.log(`✅ Scraper ${i + 1} success: Found ${data.results.length} properties (results wrapper)`);
          return {
            data: {
              properties: data.results
            }
          };
        } else if (data && data.properties && Array.isArray(data.properties)) {
          console.log(`✅ Scraper ${i + 1} success: Found ${data.properties.length} properties (properties wrapper)`);
          return {
            data: {
              properties: data.properties
            }
          };
        } else {
          console.log('⚠️ Unexpected response format:', data);
          throw new Error('Invalid response format from scraper');
        }
      } catch (error) {
        console.error(`❌ Scraper ${i + 1} failed:`, error.message);
        lastError = error;
        
        // If this is not the last URL, continue to next one
        if (i < urlsToTry.length - 1) {
          console.log('🔄 Trying next scraper...');
          continue;
        }
      }
    }

    // If we get here, all scrapers failed
    console.error('=== ALL SCRAPERS FAILED ===');
    throw new Error(`All scraper endpoints failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  async scrapeProperty(propertyUrl: string): Promise<FullPropertyResponse> {
    console.log('=== SCRAPING INDIVIDUAL PROPERTY ===');
    console.log(`Property URL: ${propertyUrl}`);
    
    // Get the current endpoint
    const endpoint = await this.getCurrentEndpoint();
    console.log(`🎯 Using scraper endpoint: ${endpoint}`);
    
    try {
      const response = await fetch(`${endpoint}/scrape-property-full`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: propertyUrl,
          backend: 'playwright'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Property scraping successful');
      return data;
    } catch (error) {
      console.error('❌ Property scraping failed:', error);
      throw error;
    }
  }

  async rateLimitDelay(): Promise<void> {
    // Add a small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
