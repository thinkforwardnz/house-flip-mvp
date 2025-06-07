
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;

/**
 * AgentQLClient for property data extraction via AgentQL API.
 * Updated with corrected TradeMe-specific DOM selectors.
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
   * Gets the TradeMe search results query using TradeMe-specific DOM selectors.
   */
  getTradeeMeSearchQuery(): string {
    return `{
      listings[] {
        listing_id(attr: "data-aria-id")
        listing_url(attr: "href")
        address
        price
        title
        bedrooms
        bathrooms
        floor_area
      }
    }`;
  }

  /**
   * Gets the TradeMe individual property page query using TradeMe-specific DOM selectors.
   */
  getTradeeMePropertyDetailQuery(): string {
    return `{
      title
      price  
      address
      bedrooms
      bathrooms
      landSize
      floorArea
      features[]
      description
      agentName
      agentContact
      photos[] {
        image_src(attr: "src")
      }
      listingDate
    }`;
  }

  /**
   * Scrapes TradeMe search results to get listing data with retry logic.
   */
  async scrapeSearchResults(searchUrl: string): Promise<any> {
    const query = this.getTradeeMeSearchQuery();
    return await this.queryDataWithRetry(searchUrl, query, 5000);
  }

  /**
   * Scrapes individual TradeMe property page for detailed information with retry logic.
   */
  async scrapePropertyDetails(propertyUrl: string): Promise<any> {
    const query = this.getTradeeMePropertyDetailQuery();
    return await this.queryDataWithRetry(propertyUrl, query, 5000);
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
