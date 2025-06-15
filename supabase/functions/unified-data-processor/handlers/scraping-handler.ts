
import { CustomScraperClient } from '../../shared/custom-scraper-client.ts';
import { buildTradeeMeSearchUrl } from '../utils/helpers.ts';
import { processAndSaveBasicProperty } from '../services/property-processor.ts';
import { ProcessingRequest, ProcessingResult } from '../types/processor-types.ts';
import { corsHeaders } from '../../shared/cors.ts';

export async function handleScraping(request: ProcessingRequest): Promise<Response> {
  const { filters = {}, sources = ['trademe'] } = request;
  
  console.log('=== SCRAPING HANDLER STARTED ===');
  console.log('Request:', JSON.stringify(request, null, 2));
  
  const scraperClient = new CustomScraperClient();
  
  let totalScraped = 0;
  let totalSkipped = 0;
  const errors: string[] = [];
  const searchUrls: string[] = [];

  // Process TradeMe scraping
  if (sources.includes('trademe')) {
    try {
      console.log('=== BUILDING TRADEME URL ===');
      const searchUrl = buildTradeeMeSearchUrl(filters);
      searchUrls.push(searchUrl);
      
      console.log('=== STARTING SEARCH SCRAPING ===');
      console.log(`Target URL: ${searchUrl}`);
      
      const searchResults = await scraperClient.scrapeSearchResults(searchUrl);
      console.log('=== SEARCH RESULTS RECEIVED ===');
      console.log(`Results structure:`, JSON.stringify({
        hasData: !!searchResults?.data,
        hasProperties: !!searchResults?.data?.properties,
        propertiesCount: searchResults?.data?.properties?.length || 0
      }));
      
      if (searchResults?.data?.properties && Array.isArray(searchResults.data.properties)) {
        console.log(`Found ${searchResults.data.properties.length} properties to process`);
        
        // Process ALL properties, not just first 50
        for (let i = 0; i < searchResults.data.properties.length; i++) {
          const property = searchResults.data.properties[i];
          console.log(`Processing property ${i + 1}/${searchResults.data.properties.length}:`, {
            id: property.id,
            title: property.title?.substring(0, 50) + '...',
            address: property.address
          });
          
          try {
            const result = await processAndSaveBasicProperty(property, 'Trade Me');
            if (result.success) {
              totalScraped++;
              console.log(`✅ Property ${i + 1} processed successfully`);
            } else {
              totalSkipped++;
              if (result.error) {
                console.log(`⚠️ Property ${i + 1} skipped: ${result.error}`);
                errors.push(`Property ${i + 1}: ${result.error}`);
              }
            }
          } catch (error) {
            console.error(`❌ Error processing property ${i + 1}:`, error);
            totalSkipped++;
            errors.push(`Property ${i + 1} processing failed: ${error.message}`);
          }
          
          // Small delay to avoid overwhelming the database
          if (i < searchResults.data.properties.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        }
      } else {
        console.log('❌ No properties found in search results');
        console.log('Search results structure:', searchResults);
        errors.push('No properties found in search results');
      }
    } catch (error) {
      console.error('=== TRADEME SCRAPING ERROR ===');
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      // Check if it's a network/URL error
      if (error.message.includes('HTTP error! status: 404')) {
        errors.push(`TradeMe URL not found (404): The search URL may be invalid or the page doesn't exist`);
      } else if (error.message.includes('HTTP error!')) {
        errors.push(`TradeMe server error: ${error.message}`);
      } else if (error.message.includes('fetch')) {
        errors.push(`Network error connecting to scraper service: ${error.message}`);
      } else {
        errors.push(`TradeMe scraping failed: ${error.message}`);
      }
    }
  }

  console.log('=== SCRAPING HANDLER COMPLETED ===');
  console.log(`Total scraped: ${totalScraped}`);
  console.log(`Total skipped: ${totalSkipped}`);
  console.log(`Errors: ${errors.length}`);
  console.log(`Search URLs: ${searchUrls.length}`);

  const success = totalScraped > 0 || errors.length === 0;
  const message = success 
    ? `Search complete: ${totalScraped} properties found and saved to feed`
    : `Search failed: ${errors.join(', ')}`;

  return new Response(JSON.stringify({
    success,
    processed: totalScraped,
    skipped: totalSkipped,
    errors,
    searchUrls,
    message,
    debug: {
      filtersReceived: filters,
      sourcesRequested: sources,
      timestamp: new Date().toISOString()
    }
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
