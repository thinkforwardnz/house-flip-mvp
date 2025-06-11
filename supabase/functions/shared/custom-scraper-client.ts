
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

  constructor() {
    this.baseUrl = Deno.env.get('CUSTOM_SCRAPER_BASE_URL') || 'https://7eeb-222-154-21-216.ngrok-free.app';
  }

  async scrapeSearchResults(searchUrl: string): Promise<{ data: { properties: CustomScraperProperty[] } }> {
    try {
      console.log(`Scraping search results from: ${searchUrl}`);
      
      const response = await fetch(`${this.baseUrl}/scrape-search-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          backend: 'playwright'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform the response to match expected format
      return {
        data: {
          properties: Array.isArray(data) ? data : []
        }
      };
    } catch (error) {
      console.error('Error scraping search results:', error);
      throw error;
    }
  }

  async scrapeProperty(propertyUrl: string): Promise<FullPropertyResponse> {
    try {
      console.log(`Scraping property from: ${propertyUrl}`);
      
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
      return data;
    } catch (error) {
      console.error('Error scraping property:', error);
      throw error;
    }
  }

  async rateLimitDelay(): Promise<void> {
    // Add a small delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
