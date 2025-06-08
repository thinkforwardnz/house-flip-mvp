
export class AgentQLSearchClient {
  private apiKey: string;
  private baseUrl = 'https://api.agentql.com/v1';

  constructor() {
    const key = Deno.env.get('AGENTQL_API_KEY');
    if (!key) {
      throw new Error('AGENTQL_API_KEY environment variable is not set');
    }
    this.apiKey = key;
  }

  async scrapeSearchResults(searchUrl: string): Promise<any> {
    try {
      console.log(`Scraping search results from: ${searchUrl}`);

      const query = `
      {
        properties[] {
          listingid
          listingurl
          listingaddress
          listingfeaturedimg
        }
      }
      `;

      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: searchUrl,
          query: query,
          wait_for_selector: '.listing-results, .property-card, .search-results',
          timeout: 30000
        }),
      });

      if (!response.ok) {
        console.error(`AgentQL API error: ${response.status} ${response.statusText}`);
        return { success: false, error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      console.log('AgentQL search results response received');

      return {
        success: true,
        data: data?.data || { properties: [] }
      };
    } catch (error) {
      console.error('Error scraping search results:', error);
      return { success: false, error: error.message };
    }
  }

  async rateLimitDelay(): Promise<void> {
    // Add a 2-second delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
