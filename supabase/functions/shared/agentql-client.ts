
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;

/**
 * AgentQLClient for property data extraction via AgentQL API.
 * Updated to support two-step scraping: search results → individual listings.
 */
export class AgentQLClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.agentql.com/v1/query';

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
   * Extracts data using structured queries.
   */
  async queryPropertyData(url: string, query: string, waitForSelector?: string): Promise<any> {
    const payload = {
      url,
      query,
      wait_for_selector: waitForSelector || '.tm-property-search-card',
      timeout: 30000
    };

    console.log('AgentQL request payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AgentQL API error:', response.status, response.statusText, errorText);
      throw new Error(`AgentQL API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('AgentQL raw response:', JSON.stringify(data, null, 2));

    if (!data || typeof data !== 'object') {
      throw new Error('AgentQL API response is not a valid object');
    }

    return data;
  }

  /**
   * Gets the TradeMe search results query to extract listing URLs.
   */
  getTradeeMeSearchQuery(): string {
    return `
{
  search_results[] {
    listing_title
    listing_url
    price_text
    address_text
    image_url
  }
}`;
  }

  /**
   * Gets the TradeMe individual property page query for detailed information.
   */
  getTradeeMePropertyDetailQuery(): string {
    return `
{
  property_details {
    title
    price
    address
    suburb
    bedrooms
    bathrooms
    floor_area
    land_area
    description
    photos[]
    listing_date
    property_features[]
  }
}`;
  }

  /**
   * Scrapes TradeMe search results to get listing URLs.
   */
  async scrapeSearchResults(searchUrl: string): Promise<any> {
    const query = this.getTradeeMeSearchQuery();
    return await this.queryPropertyData(searchUrl, query, '.tm-property-search-card');
  }

  /**
   * Scrapes individual TradeMe property page for detailed information.
   */
  async scrapePropertyDetails(propertyUrl: string): Promise<any> {
    const query = this.getTradeeMePropertyDetailQuery();
    return await this.queryPropertyData(propertyUrl, query, '.property-gallery, .tm-property-listing-body');
  }

  /**
   * Fallback query for TradeMe search results if main query fails.
   */
  getTradeeMeFallbackQuery(): string {
    return `
{
  listings[] {
    title
    url
    price
    location
    image
  }
}`;
  }
}
