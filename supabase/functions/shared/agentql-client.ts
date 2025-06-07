// deno-lint-ignore no-explicit-any
// @ts-ignore: Deno global is available in Edge Functions
declare const Deno: any;
/**
 * AgentQLClient for property data extraction via AgentQL API.
 *
 * Usage:
 *   const client = new AgentQLClient();
 *   const results = await client.extractProperties({ url, ...filters });
 */
export class AgentQLClient {
  private apiKey: string;
  private baseUrl: string = 'https://api.agentql.com/v1/extract';

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
   * Extracts property listings from a given URL using AgentQL.
   *
   * Args:
   *   params (object):
   *     - url (string): The page URL to extract listings from.
   *     - filters (object): Optional filters (keywords, price, beds, etc.)
   *
   * Returns:
   *   Promise<any[]>: Array of extracted property objects.
   */
  async extractProperties(params: { url: string; [key: string]: any }): Promise<any[]> {
    // Avoid duplicate 'url' key
    const { url, ...rest } = params;
    const payload = {
      url,
      ...rest,
    };

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
      throw new Error(`AgentQL API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    // Expecting data.properties or similar structure
    if (!data || !Array.isArray(data.properties)) {
      throw new Error('AgentQL API response missing properties array');
    }
    return data.properties;
  }
} 