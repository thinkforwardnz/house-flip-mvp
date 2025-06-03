
import { CrawlResult, PropertyData } from './types.ts';
import { wellingtonSuburbs } from './config.ts';

export function processTradeeMeData(crawlResults: CrawlResult[]): PropertyData[] {
  const properties = [];
  
  for (const result of crawlResults) {
    try {
      // Extract property data from Firecrawl result
      const extractedData = result.extract || {};
      
      if (extractedData.address && extractedData.price) {
        const property: PropertyData = {
          source_url: result.metadata?.sourceURL || result.url || '',
          address: extractedData.address,
          suburb: extractSuburb(extractedData.address),
          city: 'Wellington',
          price: parsePrice(extractedData.price),
          bedrooms: parseInt(extractedData.bedrooms || '') || null,
          bathrooms: parseFloat(extractedData.bathrooms || '') || null,
          floor_area: parseFloat(extractedData.floor_area || '') || null,
          land_area: parseFloat(extractedData.land_area || '') || null,
          summary: extractedData.description || extractedData.summary || '',
          photos: extractedData.photos || [],
          listing_date: new Date().toISOString().split('T')[0]
        };
        
        properties.push(property);
      }
    } catch (error) {
      console.error('Error processing crawl result:', error);
    }
  }
  
  return properties;
}

export function extractSuburb(address: string): string {
  for (const suburb of wellingtonSuburbs) {
    if (address.toLowerCase().includes(suburb.toLowerCase())) {
      return suburb;
    }
  }
  return 'Wellington';
}

export function parsePrice(priceStr: string): number {
  const cleaned = priceStr.replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}
