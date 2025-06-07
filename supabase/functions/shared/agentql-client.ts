
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;

/**
 * AgentQLClient for property data extraction via AgentQL API.
 * Updated to use structured queries similar to the Python SDK approach.
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
   * Extracts TradeMe property listings using structured queries.
   * 
   * Args:
   *   url (string): The TradeMe search URL to extract listings from.
   *   query (string): The AgentQL structured query for property extraction.
   * 
   * Returns:
   *   Promise<any>: The structured response from AgentQL.
   */
  async queryPropertyData(url: string, query: string): Promise<any> {
    const payload = {
      url,
      query,
      wait_for_selector: '.tm-property-search-card',
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
   * Gets the TradeMe property extraction query.
   * This structured query targets the specific elements on TradeMe property listings.
   */
  getTradeeMePropertyQuery(): string {
    return `
{
  property_listings[] {
    title
    price
    address
    suburb
    bedrooms
    bathrooms
    floor_area
    land_area
    description
    listing_url
    photos[]
    listing_date
  }
}`;
  }

  /**
   * Fallback query for TradeMe search results if main query fails.
   */
  getTradeeMeFallbackQuery(): string {
    return `
{
  search_results[] {
    property_title
    property_price
    property_address
    property_link
    property_image
  }
}`;
  }
}
