
export class AgentQLPropertyClient {
  private apiKey: string;
  private baseUrl = 'https://api.agentql.com/v1/query-data';

  constructor() {
    console.log('Initializing AgentQL Property Client...');
    
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
    console.log('AgentQL API key loaded successfully. Length:', key.length, 'characters');
    console.log('API key prefix:', key.substring(0, 8) + '...');
  }

  async scrapePropertyPage(url: string): Promise<any> {
    try {
      console.log(`Starting property page scraping for: ${url}`);
      console.log('AgentQL API Base URL:', this.baseUrl);

      const query = `
      {
        listingdetails[] {
          listingtitle
          listingdate
          listingprice
          listingmethod
          listingaddress
          listingtype
          listingparking
          listinginternet
          listingdetails[] {
            listingbed
            listingbath
            listingfloor
            listingland
            listingotherfeatures
          }
          listingdescription
          listingimages
        }
      }
      `;

      const requestBody = {
        url: url,
        query: query,
        wait_for_selector: '.listing-header, .property-details, .listing-title',
        timeout: 30000
      };

      console.log('Request payload:', JSON.stringify(requestBody, null, 2));
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
      console.log(`Request completed in ${endTime - startTime}ms`);
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      // Log response regardless of status for debugging
      const responseText = await response.text();
      console.log('Raw response body:', responseText);

      if (!response.ok) {
        console.error(`AgentQL API error: ${response.status} ${response.statusText}`);
        console.error('Error response body:', responseText);
        
        // Try to parse error response
        try {
          const errorData = JSON.parse(responseText);
          console.error('Parsed error data:', errorData);
        } catch (parseError) {
          console.error('Could not parse error response as JSON');
        }

        // Provide specific error messages based on status code
        if (response.status === 401) {
          throw new Error(`Authentication failed (401): Invalid or expired API key. Please check your AGENTQL_API_KEY in Supabase secrets.`);
        } else if (response.status === 403) {
          throw new Error(`Access forbidden (403): API key may not have required permissions.`);
        } else if (response.status === 429) {
          throw new Error(`Rate limit exceeded (429): Too many requests to AgentQL API.`);
        } else {
          throw new Error(`AgentQL API error (${response.status}): ${response.statusText}`);
        }
      }

      // Parse successful response
      let data;
      try {
        data = JSON.parse(responseText);
        console.log('Successfully parsed response JSON');
      } catch (parseError) {
        console.error('Failed to parse successful response as JSON:', parseError);
        throw new Error('Invalid JSON response from AgentQL API');
      }

      console.log('AgentQL response data structure:', {
        hasData: !!data?.data,
        hasListingDetails: !!data?.data?.listingdetails,
        listingDetailsCount: data?.data?.listingdetails?.length || 0
      });

      if (data?.data?.listingdetails?.[0]) {
        const listing = data.data.listingdetails[0];
        console.log('Processing listing data:', {
          hasTitle: !!listing.listingtitle,
          hasPrice: !!listing.listingprice,
          hasAddress: !!listing.listingaddress,
          hasDetails: !!listing.listingdetails?.[0]
        });
        
        // Process and normalize the data
        const processedData = {
          title: listing.listingtitle || null,
          date: listing.listingdate || null,
          price: this.parsePrice(listing.listingprice),
          method: listing.listingmethod || null,
          address: listing.listingaddress || null,
          type: listing.listingtype || null,
          parking: listing.listingparking || null,
          internet: listing.listinginternet || null,
          bedrooms: this.parseNumber(listing.listingdetails?.[0]?.listingbed),
          bathrooms: this.parseNumber(listing.listingdetails?.[0]?.listingbath),
          floor_area: this.parseNumber(listing.listingdetails?.[0]?.listingfloor),
          land_area: this.parseNumber(listing.listingdetails?.[0]?.listingland),
          other_features: listing.listingdetails?.[0]?.listingotherfeatures || null,
          description: listing.listingdescription || null,
          photos: this.processImages(listing.listingimages),
        };

        console.log('Processed property data:', {
          title: processedData.title,
          price: processedData.price,
          bedrooms: processedData.bedrooms,
          bathrooms: processedData.bathrooms,
          photosCount: processedData.photos.length
        });

        return processedData;
      }

      console.log('No listing details found in response');
      return null;
    } catch (error) {
      console.error('Error in scrapePropertyPage:', error);
      console.error('Error stack:', error.stack);
      
      // Re-throw with additional context
      if (error.message.includes('fetch')) {
        throw new Error(`Network error connecting to AgentQL API: ${error.message}`);
      }
      
      throw error;
    }
  }

  async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('Testing AgentQL API connection...');
      
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
      console.log('Test connection response:', response.status, responseText);

      if (response.status === 401) {
        return {
          success: false,
          message: 'Authentication failed - Invalid API key',
          details: { status: response.status, response: responseText }
        };
      }

      return {
        success: response.ok,
        message: response.ok ? 'Connection successful' : `Connection failed: ${response.status}`,
        details: { status: response.status, response: responseText }
      };
    } catch (error) {
      console.error('Test connection error:', error);
      return {
        success: false,
        message: `Connection test failed: ${error.message}`,
        details: { error: error.message }
      };
    }
  }

  async rateLimitDelay(): Promise<void> {
    // Add a 2-second delay between requests to be respectful
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  private parsePrice(priceStr: any): number {
    if (!priceStr) return 0;
    console.log('Parsing price:', priceStr);
    const cleaned = priceStr.toString().replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    const result = isNaN(parsed) ? 0 : parsed;
    console.log('Parsed price result:', result);
    return result;
  }

  private parseNumber(numStr: any): number | null {
    if (!numStr) return null;
    console.log('Parsing number:', numStr);
    const cleaned = numStr.toString().replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    const result = isNaN(parsed) ? null : parsed;
    console.log('Parsed number result:', result);
    return result;
  }

  private processImages(images: any): string[] {
    console.log('Processing images:', typeof images, Array.isArray(images) ? images.length : 'not array');
    
    if (!images) return [];
    
    if (Array.isArray(images)) {
      const filtered = images.filter(img => typeof img === 'string' && img.trim().length > 0);
      console.log('Filtered images count:', filtered.length);
      return filtered;
    }
    
    if (typeof images === 'string' && images.trim().length > 0) {
      console.log('Single image found');
      return [images];
    }
    
    return [];
  }
}
