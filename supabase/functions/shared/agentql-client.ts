
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;

/**
 * AgentQLClient for comprehensive property data extraction via AgentQL API.
 * Enhanced for Trade Me with detailed property information including descriptions and features.
 */
export class AgentQLClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.agentql.com/v1/query-data';

  constructor() {
    // Safely access Deno.env.get for Supabase Edge Functions
    let apiKey = '';
    try {
      if (typeof Deno !== 'undefined' && Deno.env && typeof Deno.env.get === 'function') {
        apiKey = Deno.env.get('AGENTQL_API_KEY') || '';
      }
    } catch (_) {
      apiKey = '';
    }
    this.apiKey = apiKey;
    if (!this.apiKey) {
      throw new Error('AgentQL API key not configured in environment');
    }
  }

  /**
   * Executes an AgentQL query using the correct /query-data endpoint and payload structure.
   */
  async queryData(url: string, query: string, waitFor: number = 0): Promise<any> {
    const payload = {
      url: url,
      query: query,
      params: {
        wait_for: waitFor,
        is_scroll_to_bottom_enabled: false
      }
    };

    console.log('AgentQL request to:', this.baseUrl);
    console.log('AgentQL payload:', JSON.stringify(payload, null, 2));
    console.log('API Key configured:', !!this.apiKey);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('AgentQL response status:', response.status, response.statusText);
      console.log('AgentQL response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AgentQL API error details:', errorText);
        throw new Error(`AgentQL API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('AgentQL response data:', JSON.stringify(data, null, 2));

      if (!data || typeof data !== 'object') {
        throw new Error('AgentQL API response is not a valid object');
      }

      return data;
    } catch (error) {
      console.error('AgentQL request failed:', error);
      throw error;
    }
  }

  /**
   * Enhanced TradeMe search results query - captures basic listing metadata including featured image.
   */
  getTradeeMeSearchQuery(): string {
    return `{
      properties[] {
        listingid
        listingfeaturedimg
        listingurl
        listingaddress
        listingprice
        listingbeds
        listingbaths
      }
    }`;
  }

  /**
   * Comprehensive TradeMe individual property page query for detailed data enrichment.
   * Captures all property details, description, features, and comprehensive photo gallery.
   */
  getTradeeMePropertyQuery(): string {
    return `{
      property_details {
        price
        bedrooms
        bathrooms
        floor_area
        land_area
        property_type
        year_built
        parking_spaces
      }
      description
      summary
      property_features[]
      auction_info {
        auction_date
        auction_time
        tender_closes
      }
      agent_details {
        agent_name
        agency_name
        agent_phone
      }
      photos[] {
        image_src
        image_alt
      }
      listing_date
      listing_status
      property_address {
        full_address
        suburb
        city
        district
      }
    }`;
  }

  /**
   * TradeMe comparable sales query for market analysis.
   * Captures nearby sold properties from the property insights section.
   */
  getTradeeMeComparablesQuery(): string {
    return `{
      nearby_sold_properties[] {
        sold_price
        sold_date
        address
        bedrooms
        bathrooms
        floor_area
        land_area
        property_type
        days_on_market
        listing_url
      }
      market_summary {
        median_sold_price
        average_days_on_market
        total_sold_properties
        price_trend
      }
    }`;
  }

  /**
   * Scrapes TradeMe search results to get comprehensive listing metadata with retry logic.
   */
  async scrapeSearchResults(searchUrl: string): Promise<any> {
    const query = this.getTradeeMeSearchQuery();
    return await this.queryDataWithRetry(searchUrl, query, 5000);
  }

  /**
   * Scrapes individual TradeMe property page for comprehensive data enrichment.
   */
  async scrapePropertyPage(propertyUrl: string): Promise<any> {
    const query = this.getTradeeMePropertyQuery();
    const result = await this.queryDataWithRetry(propertyUrl, query, 3000);
    
    // Process the result to extract and structure all property data
    const processedData = this.processPropertyPageData(result);
    return processedData;
  }

  /**
   * Scrapes comparable sales data from TradeMe property insights page.
   * This method finds the "Nearby Sold Properties" section for market analysis.
   */
  async scrapeComparableSales(address: string, suburb: string, city: string): Promise<any[]> {
    try {
      console.log(`Scraping comparable sales for: ${address}, ${suburb}, ${city}`);
      
      // Build the property insights URL - Trade Me uses a specific format for property insights
      const searchTerm = `${address} ${suburb} ${city}`.replace(/\s+/g, '-').toLowerCase();
      const insightsUrl = `https://www.trademe.co.nz/a/property/residential/sale/${searchTerm}`;
      
      console.log('Property insights URL:', insightsUrl);
      
      const query = this.getTradeeMeComparablesQuery();
      const result = await this.queryDataWithRetry(insightsUrl, query, 5000);
      
      if (!result || !result.data) {
        console.log('No comparable sales data found');
        return [];
      }
      
      // Process and return comparable sales
      const comparables = this.processComparableSalesData(result.data);
      console.log(`Found ${comparables.length} comparable sales`);
      
      return comparables;
    } catch (error) {
      console.error('Error scraping comparable sales:', error);
      return [];
    }
  }

  /**
   * Process comparable sales data from AgentQL response.
   */
  private processComparableSalesData(data: any): any[] {
    console.log('Processing comparable sales data:', JSON.stringify(data, null, 2));
    
    try {
      const comparables: any[] = [];
      
      if (Array.isArray(data.nearby_sold_properties)) {
        for (const property of data.nearby_sold_properties) {
          const comparable = {
            sold_price: this.parseNumericValue(property.sold_price),
            sold_date: property.sold_date || null,
            address: property.address || null,
            bedrooms: this.parseNumericValue(property.bedrooms),
            bathrooms: this.parseNumericValue(property.bathrooms),
            floor_area: this.parseNumericValue(property.floor_area),
            land_area: this.parseNumericValue(property.land_area),
            property_type: property.property_type || null,
            days_on_market: this.parseNumericValue(property.days_on_market),
            listing_url: property.listing_url || null
          };
          
          // Only add if we have essential data
          if (comparable.sold_price && comparable.address) {
            comparables.push(comparable);
          }
        }
      }
      
      return comparables;
    } catch (error) {
      console.error('Error processing comparable sales data:', error);
      return [];
    }
  }

  /**
   * Process comprehensive property page data from AgentQL response.
   */
  private processPropertyPageData(response: any): any {
    console.log('Processing comprehensive property page data:', JSON.stringify(response, null, 2));
    
    try {
      const data = response.data || response;
      const photos: string[] = [];
      
      // Extract photos
      if (Array.isArray(data.photos)) {
        for (const photo of data.photos) {
          if (photo.image_src) {
            let photoUrl = photo.image_src;
            // Ensure photo URL is absolute
            if (photoUrl.startsWith('/')) {
              photoUrl = `https://www.trademe.co.nz${photoUrl}`;
            }
            photos.push(photoUrl);
          }
        }
      }

      // Extract property details
      const propertyDetails = data.property_details || {};
      
      // Extract address information
      const addressInfo = data.property_address || {};
      
      // Extract agent information
      const agentInfo = data.agent_details || {};
      
      // Extract auction information
      const auctionInfo = data.auction_info || {};

      console.log(`Extracted ${photos.length} photos and comprehensive property data`);
      
      return {
        // Core property data
        photos: photos,
        bedrooms: this.parseNumericValue(propertyDetails.bedrooms),
        bathrooms: this.parseNumericValue(propertyDetails.bathrooms),
        floor_area: this.parseNumericValue(propertyDetails.floor_area),
        land_area: this.parseNumericValue(propertyDetails.land_area),
        price: this.parseNumericValue(propertyDetails.price),
        property_type: propertyDetails.property_type || null,
        year_built: this.parseNumericValue(propertyDetails.year_built),
        parking_spaces: this.parseNumericValue(propertyDetails.parking_spaces),
        
        // Description and features
        description: data.description || null,
        summary: data.summary || null,
        property_features: Array.isArray(data.property_features) ? data.property_features : [],
        
        // Address details
        full_address: addressInfo.full_address || null,
        suburb: addressInfo.suburb || null,
        city: addressInfo.city || null,
        district: addressInfo.district || null,
        
        // Agent information
        agent_name: agentInfo.agent_name || null,
        agency_name: agentInfo.agency_name || null,
        agent_phone: agentInfo.agent_phone || null,
        
        // Auction/tender information
        auction_date: auctionInfo.auction_date || null,
        auction_time: auctionInfo.auction_time || null,
        tender_closes: auctionInfo.tender_closes || null,
        
        // Listing metadata
        listing_date: data.listing_date || null,
        listing_status: data.listing_status || null
      };
    } catch (error) {
      console.error('Error processing comprehensive property page data:', error);
      return { photos: [] };
    }
  }

  /**
   * Helper function to parse numeric values safely
   */
  private parseNumericValue(value: any): number | null {
    if (!value) return null;
    const cleaned = value.toString().replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  /**
   * Query data with retry logic and rate limiting.
   */
  async queryDataWithRetry(url: string, query: string, waitFor: number = 0, maxRetries: number = 3): Promise<any> {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`AgentQL attempt ${attempt}/${maxRetries} for URL: ${url}`);
        
        const result = await this.queryData(url, query, waitFor);
        
        // Success - return result
        return result;
        
      } catch (error) {
        lastError = error as Error;
        console.error(`AgentQL attempt ${attempt} failed:`, error);
        
        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          const delay = attempt * 2000; // Progressive delay: 2s, 4s, 6s
          console.log(`Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    // All retries failed
    throw new Error(`AgentQL failed after ${maxRetries} attempts. Last error: ${lastError?.message}`);
  }

  /**
   * Simple test query to verify API connectivity using correct endpoint.
   */
  async testConnection(testUrl: string = 'https://www.trademe.co.nz'): Promise<any> {
    const testQuery = `{
      title
    }`;
    console.log('Testing AgentQL connection with simple query...');
    return await this.queryData(testUrl, testQuery, 1000);
  }

  /**
   * Rate-limited delay between requests to avoid being blocked.
   */
  async rateLimitDelay(): Promise<void> {
    const delay = 2000; // 2 second delay between requests
    console.log(`Rate limiting: waiting ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
}
