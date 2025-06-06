
// TradeMe-specific Apify actor configuration
export const TRADEME_ACTOR_ID = 'your-trademe-actor-id'; // This will need to be created in Apify Console

export function buildTradeeMeApifyInput(filters: any) {
  const baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
  const searches = [];
  
  // Build search URL with filters
  const params = new URLSearchParams();
  if (filters.keywords) {
    const keywords = filters.keywords.split(',').map((k: string) => k.trim());
    params.append('search_string', keywords[0] || '');
  }
  if (filters.minPrice) params.append('price_min', filters.minPrice);
  if (filters.maxPrice) params.append('price_max', filters.maxPrice);
  if (filters.minBeds) params.append('bedrooms_min', filters.minBeds);
  if (filters.maxBeds) params.append('bedrooms_max', filters.maxBeds);
  if (filters.suburb) params.append('suburb', filters.suburb);
  
  const searchUrl = `${baseUrl}?${params.toString()}`;
  
  searches.push({
    url: searchUrl,
    maxItems: 50,
    ...filters
  });
  
  return { searches };
}

export function processTradeeMeResults(results: any[]) {
  return results.map(item => {
    try {
      return {
        source_url: item.url || '',
        address: item.address || '',
        suburb: extractSuburb(item.address || ''),
        price: parsePrice(item.price),
        bedrooms: parseInt(item.bedrooms) || null,
        bathrooms: parseFloat(item.bathrooms) || null,
        floor_area: parseFloat(item.floorArea) || null,
        land_area: parseFloat(item.landArea) || null,
        summary: item.description || '',
        photos: Array.isArray(item.photos) ? item.photos : [],
        listing_date: item.listingDate || new Date().toISOString().split('T')[0]
      };
    } catch (error) {
      console.error('Error processing TradeMe result:', error, item);
      return null;
    }
  }).filter(Boolean);
}

function extractSuburb(address: string): string {
  const wellingtonSuburbs = [
    'Wellington Central', 'Kelburn', 'Mount Victoria', 'Thorndon', 'Te Aro', 'Newtown', 'Island Bay',
    'Petone', 'Lower Hutt', 'Wainuiomata', 'Eastbourne', 'Stokes Valley',
    'Upper Hutt', 'Totara Park', 'Heretaunga', 'Trentham',
    'Porirua', 'Whitby', 'Paremata', 'Plimmerton',
    'Paraparaumu', 'Waikanae', 'Otaki'
  ];

  for (const suburb of wellingtonSuburbs) {
    if (address.toLowerCase().includes(suburb.toLowerCase())) {
      return suburb;
    }
  }
  return 'Wellington';
}

function parsePrice(priceStr: string | number): number {
  if (typeof priceStr === 'number') return priceStr;
  const cleaned = String(priceStr).replace(/[^0-9]/g, '');
  return parseInt(cleaned) || 0;
}
