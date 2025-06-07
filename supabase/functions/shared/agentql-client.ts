
// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;

/**
 * AgentQLClient for property data extraction via AgentQL API.
 * Updated to use correct API endpoint and payload structure.
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
   * Extracts data using AgentQL structured queries with correct API format.
   */
  async queryPropertyData(url: string, query: string): Promise<any> {
    const payload = {
      url,
      query,
      is_scroll_to_bottom: false,
      wait_for: {
        selector: '.tm-property-search-card, .property-gallery, .tm-property-listing-body',
        timeout_ms: 30000
      }
    };

    console.log('AgentQL request payload:', JSON.stringify(payload, null, 2));
    console.log('Using API endpoint:', this.baseUrl);
    console.log('API Key configured:', !!this.apiKey);

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

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AgentQL API error details:', errorText);
        throw new Error(`AgentQL API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('AgentQL raw response:', JSON.stringify(data, null, 2));

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
   * Gets the TradeMe search results query using proper AgentQL syntax.
   */
  getTradeeMeSearchQuery(): string {
    return `
{
  search_results: [
    {
      title
      price
      address
      link(href)
      image(src)
    }
  ] @tm-property-search-card
}`;
  }

  /**
   * Gets the TradeMe individual property page query using proper AgentQL syntax.
   */
  getTradeeMePropertyDetailQuery(): string {
    return `
{
  property_details: {
    title
    price
    address
    bedrooms
    bathrooms
    floor_area
    land_area
    description
    photos: [
      {
        src
      }
    ]
    listing_date
  } @property-listing-body, @tm-property-listing-body
}`;
  }

  /**
   * Scrapes TradeMe search results to get listing URLs.
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
   * Fallback query for TradeMe search results if main query fails.
   */
  getTradeeMeFallbackQuery(): string {
    return `
{
  listings: [
    {
      title
      url(href)
      price
      location
      image(src)
    }
  ] @property-card, @listing-card
}`;
  }
}
