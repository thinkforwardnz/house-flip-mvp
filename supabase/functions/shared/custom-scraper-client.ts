
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
  private baseUrl: string;
  private fallbackUrls: string[];

  constructor() {
    // Initialize with environment variable as fallback
    this.baseUrl = Deno.env.get('CUSTOM_SCRAPER_BASE_URL') || 'https://e104-222-154-21-216.ngrok-free.app';
    this.fallbackUrls = [
      'https://e104-222-154-21-216.ngrok-free.app',
    ];
  }

  private async loadCurrentEndpoint(): Promise<string> {
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
        console.log(`Loaded endpoint from database: ${endpoint}`);
        
        // Update baseUrl and fallbackUrls with the current endpoint
        this.baseUrl = endpoint;
        this.fallbackUrls = [endpoint, ...this.fallbackUrls.filter(url => url !== endpoint)];
        
        return endpoint;
      } else {
        console.warn('Failed to load endpoint from database, using fallback');
        return this.baseUrl;
      }
    } catch (error) {
      console.error('Error loading endpoint from database:', error);
      return this.baseUrl;
    }
  }

  async scrapeSearchResults(searchUrl: string): Promise<{ data: { properties: CustomScraperProperty[] } }> {
    console.log('=== CUSTOM SCRAPER CLIENT ===');
    
    // Load the current endpoint before scraping
    await this.loadCurrentEndpoint();
    
    console.log(`Current scraper URL: ${this.baseUrl}`);
    console.log(`Search URL to scrape: ${searchUrl}`);
    
    // Validate the search URL first
    try {
      new URL(searchUrl);
    } catch (error) {
      throw new Error(`Invalid search URL provided: ${searchUrl}`);
    }

    const urls = [this.baseUrl, ...this.fallbackUrls];
    let lastError: Error | null = null;

    for (let i = 0; i < urls.length; i++) {
      const scraperUrl = urls[i];
      console.log(`Attempting scraper ${i + 1}/${urls.length}: ${scraperUrl}`);
      
      try {
        const endpoint = `${scraperUrl}/scrape-search-results`;
        console.log(`Making request to: ${endpoint}`);
        
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

        console.log(`Response status: ${response.status} ${response.statusText}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Response received, parsing...');
        console.log(`Data type: ${typeof data}`);
        console.log(`Is array: ${Array.isArray(data)}`);
        
        if (Array.isArray(data)) {
          console.log(`✅ Scraper ${i + 1} success: Found ${data.length} properties`);
          return {
            data: {
              properties: data
            }
          };
        } else if (data && data.properties && Array.isArray(data.properties)) {
          console.log(`✅ Scraper ${i + 1} success: Found ${data.properties.length} properties`);
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
        if (i < urls.length - 1) {
          console.log('Trying next scraper...');
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
    
    // Load the current endpoint before scraping
    await this.loadCurrentEndpoint();
    
    try {
      const response = await fetch(`${this.baseUrl}/scrape-property-full`, {
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
