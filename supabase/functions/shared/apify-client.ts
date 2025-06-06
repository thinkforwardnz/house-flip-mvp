
export interface ApifyActorInput {
  searches: Array<{
    url: string;
    maxItems?: number;
    keywords?: string;
    minPrice?: string;
    maxPrice?: string;
    minBeds?: string;
    maxBeds?: string;
    suburb?: string;
  }>;
}

export interface ApifyPropertyResult {
  url: string;
  address: string;
  price: string | number;
  bedrooms: string | number;
  bathrooms: string | number;
  floorArea: string | number;
  landArea: string | number;
  description: string;
  photos: string[];
  suburb?: string;
  listingDate?: string;
}

export class ApifyClient {
  private apiToken: string;
  private baseUrl = 'https://api.apify.com/v2';

  constructor(apiToken: string) {
    this.apiToken = apiToken;
  }

  async runActor(actorId: string, input: ApifyActorInput): Promise<string> {
    const response = await fetch(`${this.baseUrl}/acts/${actorId}/runs`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ input }),
    });

    if (!response.ok) {
      throw new Error(`Apify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.data.id;
  }

  async waitForRun(runId: string, maxWaitTime = 300000): Promise<any> {
    const startTime = Date.now();
    
    while (Date.now() - startTime < maxWaitTime) {
      const response = await fetch(`${this.baseUrl}/actor-runs/${runId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to check run status: ${response.status}`);
      }

      const runData = await response.json();
      const status = runData.data.status;

      if (status === 'SUCCEEDED') {
        return runData.data;
      } else if (status === 'FAILED' || status === 'ABORTED' || status === 'TIMED-OUT') {
        throw new Error(`Actor run ${status}: ${runData.data.statusMessage || 'Unknown error'}`);
      }

      // Wait 5 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    throw new Error('Actor run timed out');
  }

  async getDatasetItems(datasetId: string): Promise<ApifyPropertyResult[]> {
    const response = await fetch(`${this.baseUrl}/datasets/${datasetId}/items`, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch dataset: ${response.status}`);
    }

    return await response.json();
  }

  async runActorAndGetResults(actorId: string, input: ApifyActorInput): Promise<ApifyPropertyResult[]> {
    console.log(`Starting Apify actor ${actorId} with input:`, JSON.stringify(input, null, 2));
    
    const runId = await this.runActor(actorId, input);
    console.log(`Actor run started with ID: ${runId}`);
    
    const runData = await this.waitForRun(runId);
    console.log(`Actor run completed. Default dataset ID: ${runData.defaultDatasetId}`);
    
    const results = await this.getDatasetItems(runData.defaultDatasetId);
    console.log(`Retrieved ${results.length} items from dataset`);
    
    return results;
  }
}
