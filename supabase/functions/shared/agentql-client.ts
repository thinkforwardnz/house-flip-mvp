
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;

/**
 * AgentQLClient for property data extraction via AgentQL API.
 * Updated to use correct API endpoint and payload structure based on official docs.
 */
export class AgentQLClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.agentql.com/v1/query-page';

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
   * Extracts data using AgentQL with correct API format from official docs.
   */
  async queryPropertyData(pageUrl: string, query: string): Promise<any> {
    const payload = {
      page_url: pageUrl,
      query: query,
      wait_for_timeout_ms: 30000
    };

    console.log('AgentQL request to:', this.baseUrl);
    console.log('AgentQL payload:', JSON.stringify(payload, null, 2));
    console.log('API Key configured:', !!this.apiKey);
    console.log('API Key length:', this.apiKey.length);

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
   * Gets the TradeMe search results query using AgentQL syntax.
   */
  getTradeeMeSearchQuery(): string {
    return `
{
  property_listings[] {
    title
    listing_url
    price
    address
    image_url
  }
}`;
  }

  /**
   * Gets the TradeMe individual property page query using AgentQL syntax.
   */
  getTradeeMePropertyDetailQuery(): string {
    return `
{
  property_info {
    title
    price
    address
    bedrooms
    bathrooms
    floor_area
    land_area
    description
    photos[] {
      image_src
    }
    listing_date
  }
}`;
  }

  /**
   * Scrapes TradeMe search results to get listing data.
   */
  async scrapeSearchResults(searchUrl: string): Promise<any> {
    const query = this.getTradeeMeSearchQuery();
    return await this.queryPropertyData(searchUrl, query);
  }

  /**
   * Scrapes individual TradeMe property page for detailed information.
   */
  async scrapePropertyDetails(propertyUrl: string): Promise<any> {
    const query = this.getTradeeMePropertyDetailQuery();
    return await this.queryPropertyData(propertyUrl, query);
  }

  /**
   * Simple test query to verify API connectivity.
   */
  async testConnection(testUrl: string = 'https://www.trademe.co.nz'): Promise<any> {
    const testQuery = `
{
  page_title
}`;
    console.log('Testing AgentQL connection with simple query...');
    return await this.queryPropertyData(testUrl, testQuery);
  }
}
