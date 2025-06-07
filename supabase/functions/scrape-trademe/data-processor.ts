
import { PropertyData } from './types.ts';
import { extractSuburb } from './url-builder.ts';

/**
 * Process search results to extract listing URLs
 */
export function processSearchResults(response: any): string[] {
  const listingUrls: string[] = [];
  
  console.log('Processing search results:', JSON.stringify(response, null, 2));
  
  // Handle AgentQL response structure
  const searchResults = response.search_results || response.listings || [];
  
  if (Array.isArray(searchResults)) {
    for (const result of searchResults) {
      try {
        let url = result.link || result.url || result.href;
        
        if (url) {
          // Ensure URL is absolute
          if (url.startsWith('/')) {
            url = `https://www.trademe.co.nz${url}`;
          }
          
          // Validate TradeMe URL
          if (url.includes('trademe.co.nz') && !listingUrls.includes(url)) {
            listingUrls.push(url);
          }
        }
      } catch (error) {
        console.error('Error processing search result:', error, result);
      }
    }
  }
  
  console.log(`Extracted ${listingUrls.length} listing URLs from search results`);
  return listingUrls;
}

/**
 * Process individual property details page
 */
export function processPropertyDetails(response: any, listingUrl: string, searchUrl: string): PropertyData | null {
  console.log('Processing property details for:', listingUrl);
  console.log('Property details response:', JSON.stringify(response, null, 2));
  
  try {
    const details = response.property_details || response;
    
    if (!details) {
      console.warn('No property details found in response');
      return null;
    }
    
    const title = details.title || '';
    const address = details.address || title;
    const priceStr = details.price || '0';
    const price = parsePrice(priceStr);
    
    if (!address || price === 0) {
      console.warn('Missing required fields: address or price');
      return null;
    }
    
    // Extract photos from AgentQL response
    const photos: string[] = [];
    if (Array.isArray(details.photos)) {
      for (const photo of details.photos) {
        if (photo.src) {
          photos.push(photo.src);
        }
      }
    }
    
    const property: PropertyData = {
      source_url: listingUrl,
      address: address,
      suburb: extractSuburb(address),
      city: 'Wellington',
      price: price,
      bedrooms: parseInteger(details.bedrooms),
      bathrooms: parseFloat(details.bathrooms || '') || null,
      floor_area: parseFloat(details.floor_area || '') || null,
      land_area: parseFloat(details.land_area || '') || null,
      summary: details.description || title || '',
      photos: photos,
      listing_date: details.listing_date || new Date().toISOString().split('T')[0]
    };
    
    console.log('Successfully processed property:', property.address);
    return property;
    
  } catch (error) {
    console.error('Error processing property details:', error);
    return null;
  }
}

function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  
  // Remove common price prefixes and suffixes
  const cleaned = priceStr
    .replace(/\$|,|\s+/g, '')
    .replace(/NZD|nzd/gi, '')
    .replace(/[^0-9]/g, '');
  
  const parsed = parseInt(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function parseInteger(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = parseInt(value.replace(/[^0-9]/g, ''));
  return isNaN(parsed) ? null : parsed;
}
