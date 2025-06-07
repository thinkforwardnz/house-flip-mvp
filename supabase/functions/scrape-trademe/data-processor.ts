
import { PropertyData } from './types.ts';
import { extractSuburb } from './url-builder.ts';

/**
 * Process search results to extract listing URLs from corrected AgentQL response
 */
export function processSearchResults(response: any): string[] {
  const listingUrls: string[] = [];
  
  console.log('Processing AgentQL search results:', JSON.stringify(response, null, 2));
  
  // Handle corrected AgentQL response structure
  const listings = response.property_listings || response.data?.property_listings || [];
  
  if (Array.isArray(listings)) {
    for (const listing of listings) {
      try {
        let url = listing.listing_url || listing.url || listing.href;
        
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
        console.error('Error processing search result:', error, listing);
      }
    }
  }
  
  console.log(`Extracted ${listingUrls.length} listing URLs from AgentQL results`);
  return listingUrls;
}

/**
 * Process individual property details page from corrected AgentQL response
 */
export function processPropertyDetails(response: any, listingUrl: string, searchUrl: string): PropertyData | null {
  console.log('Processing AgentQL property details for:', listingUrl);
  console.log('Property details response:', JSON.stringify(response, null, 2));
  
  try {
    const details = response.property_info || response.data?.property_info || response;
    
    if (!details) {
      console.warn('No property_info found in AgentQL response');
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
    
    // Extract photos from corrected AgentQL response
    const photos: string[] = [];
    if (Array.isArray(details.photos)) {
      for (const photo of details.photos) {
        if (photo.image_src) {
          photos.push(photo.image_src);
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
    
    console.log('Successfully processed property from AgentQL:', property.address);
    return property;
    
  } catch (error) {
    console.error('Error processing AgentQL property details:', error);
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
