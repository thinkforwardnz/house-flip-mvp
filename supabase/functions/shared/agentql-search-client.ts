
export class AgentQLSearchClient {
  private apiKey: string;
  private baseUrl = 'https://api.agentql.com/v1/query-data';

  constructor() {
    console.log('Initializing AgentQL Search Client...');
    
    const key = Deno.env.get('AGENTQL_API_KEY');
    if (!key) {
      console.error('AGENTQL_API_KEY environment variable is not set');
      throw new Error('AGENTQL_API_KEY environment variable is not set');
    }
    
    // Validate API key format (basic validation)
    if (key.length < 10) {
      console.error('AGENTQL_API_KEY appears to be too short:', key.length, 'characters');
      throw new Error('AGENTQL_API_KEY appears to be invalid (too short)');
    }
    
    this.apiKey = key;
    console.log('AgentQL Search API key loaded successfully. Length:', key.length, 'characters');
    console.log('API key prefix:', key.substring(0, 8) + '...');
  }

  async scrapeSearchResults(searchUrl: string): Promise<any> {
    try {
      console.log(`Starting search results scraping for: ${searchUrl}`);
      console.log('AgentQL API Base URL:', this.baseUrl);

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

      const requestBody = {
        url: searchUrl,
        query: query,
        wait_for_selector: '.listing-results, .property-card, .search-results',
        timeout: 30000
      };

      console.log('Search request payload:', JSON.stringify(requestBody, null, 2));
      console.log('Authorization header format: Bearer [API_KEY_LENGTH:', this.apiKey.length, ']');

      const startTime = Date.now();
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'Supabase-Edge-Function/1.0',
        },
        body: JSON.stringify(requestBody),
      });

      const endTime = Date.now();
      console.log(`Search request completed in ${endTime - startTime}ms`);
      console.log('Search response status:', response.status, response.statusText);
      console.log('Search response headers:', Object.fromEntries(response.headers.entries()));

      // Log response regardless of status for debugging
      const responseText = await response.text();
      console.log('Raw search response body:', responseText);

      if (!response.ok) {
        console.error(`AgentQL Search API error: ${response.status} ${response.statusText}`);
        console.error('Search error response body:', responseText);
        
        // Try to parse error response
        try {
          const errorData = JSON.parse(responseText);
          console.error('Parsed search error data:', errorData);
        } catch (parseError) {
          console.error('Could not parse search error response as JSON');
        }

        // Provide specific error messages based on status code
        if (response.status === 401) {
          throw new Error(`Authentication failed (401): Invalid or expired API key. Please check your AGENTQL_API_KEY in Supabase secrets.`);
        } else if (response.status === 403) {
          throw new Error(`Access forbidden (403): API key may not have required permissions.`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded (429): Too many requests to AgentQL API.`);
        } else {
          throw new Error(`AgentQL Search API error (${response.status}): ${response.statusText}`);
        }
      }

      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Successfully parsed search response JSON');
      } catch (parseError) {
        console.error('Failed to parse successful search response as JSON:', parseError);
        throw new Error('Invalid JSON response from AgentQL Search API');
      }

      console.log('AgentQL search response data structure:', {
        hasData: !!data?.data,
        hasProperties: !!data?.data?.properties,
        propertiesCount: data?.data?.properties?.length || 0
      });

      return {
        success: true,
        data: data?.data || { properties: [] }
      };
    } catch (error) {
      console.error('Error in scrapeSearchResults:', error);
      console.error('Search error stack:', error.stack);
      
      // Re-throw with additional context
      if (error.message.includes('fetch')) {
        throw new Error(`Network error connecting to AgentQL Search API: ${error.message}`);
      }
      
      return { success: false, error: error.message };
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('Testing AgentQL Search API connection...');
      
      const testUrl = 'https://example.com';
      const simpleQuery = '{ title }';
      
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: testUrl,
          query: simpleQuery,
          timeout: 10000
        }),
      });

      const responseText = await response.text();
      console.log('Search test connection response:', response.status, responseText);

      if (response.status === 401) {
        return {
          success: false,
          message: 'Authentication failed - Invalid API key',
          details: { status: response.status, response: responseText }
        };
      }

      return {
        success: response.ok,
        message: response.ok ? 'Search connection successful' : `Search connection failed: ${response.status}`,
        details: { status: response.status, response: responseText }
      };
    } catch (error) {
      console.error('Search test connection error:', error);
      return {
        success: false,
        message: `Search connection test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async rateLimitDelay(): Promise<void> {
    // Add a 2-second delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
}
