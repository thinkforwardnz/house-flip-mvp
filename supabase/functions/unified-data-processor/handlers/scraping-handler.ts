
import { CustomScraperClient } from '../../shared/custom-scraper-client.ts';
import { buildTradeeMeSearchUrl } from '../utils/helpers.ts';
import { processAndSaveBasicProperty } from '../services/property-processor.ts';
import { ProcessingRequest, ProcessingResult } from '../types/processor-types.ts';
import { corsHeaders } from '../../shared/cors.ts';

export async function handleScraping(request: ProcessingRequest): Promise<Response> {
  const { filters = {}, sources = ['trademe'] } = request;
  const scraperClient = new CustomScraperClient();
  
  let totalScraped = 0;
  let totalSkipped = 0;
  const errors: string[] = [];

  // Process TradeMe scraping
  if (sources.includes('trademe')) {
    try {
      const searchUrl = buildTradeeMeSearchUrl(filters);
      console.log(`Scraping search results from: ${searchUrl}`);
      
      const searchResults = await scraperClient.scrapeSearchResults(searchUrl);
      
      if (searchResults?.data?.properties) {
        console.log(`Found ${searchResults.data.properties.length} properties to process`);
        
        // Process ALL properties, not just first 50
        for (const property of searchResults.data.properties) {
          const result = await processAndSaveBasicProperty(property, 'Trade Me');
          if (result.success) {
            totalScraped++;
          } else {
            totalSkipped++;
            if (result.error) errors.push(result.error);
          }
          
          // Small delay to avoid overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } else {
        console.log('No properties found in search results');
      }
    } catch (error) {
      console.error('TradeMe scraping error:', error);
      errors.push(`TradeMe scraping failed: ${error.message}`);
    }
  }

  return new Response(JSON.stringify({
    success: true,
    processed: totalScraped,
    skipped: totalSkipped,
    errors,
    message: `Search complete: ${totalScraped} properties found and saved to feed`
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
