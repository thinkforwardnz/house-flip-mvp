
export class AgentQLClient {
  private apiKey: string;
  private baseUrl = 'https://api.agentql.com/v1';

  constructor() {
    const key = Deno.env.get('AGENTQL_API_KEY');
    if (!key) {
      throw new Error('AGENTQL_API_KEY environment variable is not set');
    }
    this.apiKey = key;
  }

  async scrapePropertyPage(url: string): Promise<any> {
    try {
      console.log(`Scraping individual property page: ${url}`);

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

      const response = await fetch(`${this.baseUrl}/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url,
          query: query,
          wait_for_selector: '.listing-header, .property-details, .listing-title',
          timeout: 30000
        }),
      });

      if (!response.ok) {
        console.error(`AgentQL API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const data = await response.json();
      console.log('AgentQL property page response:', JSON.stringify(data, null, 2));

      if (data?.data?.listingdetails?.[0]) {
        const listing = data.data.listingdetails[0];
        
        // Process and normalize the data
        return {
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
      }

      return null;
    } catch (error) {
      console.error('Error scraping property page:', error);
      return null;
    }
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
          listingprice
          listingbeds
          listingbaths
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

  private parsePrice(priceStr: any): number {
    if (!priceStr) return 0;
    const cleaned = priceStr.toString().replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }

  private parseNumber(numStr: any): number | null {
    if (!numStr) return null;
    const cleaned = numStr.toString().replace(/[^\d.]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? null : parsed;
  }

  private processImages(images: any): string[] {
    if (!images) return [];
    
    if (Array.isArray(images)) {
      return images.filter(img => typeof img === 'string' && img.trim().length > 0);
    }
    
    if (typeof images === 'string' && images.trim().length > 0) {
      return [images];
    }
    
    return [];
  }
}
