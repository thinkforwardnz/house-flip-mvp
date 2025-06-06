
// OneRoof-specific Apify actor configuration
export const ONEROOF_ACTOR_ID = 'your-oneroof-actor-id'; // This will need to be created in Apify Console

export function buildOneRoofApifyInput(filters: any) {
  const baseUrl = 'https://www.oneroof.co.nz/for-sale/wellington';
  const searches = [];
  
  // Build search URL with filters
  const params = new URLSearchParams();
  if (filters.minPrice) params.append('price_min', filters.minPrice);
  if (filters.maxPrice) params.append('price_max', filters.maxPrice);
  if (filters.minBeds) params.append('bedrooms_min', filters.minBeds);
  if (filters.suburb) params.append('suburb', filters.suburb);
  
  const searchUrl = `${baseUrl}?${params.toString()}`;
  
  searches.push({
    url: searchUrl,
    maxItems: 50,
    ...filters
  });
  
  return { searches };
}

export function processOneRoofResults(results: any[]) {
  return results.map(item => {
    try {
      if (!item.address || !item.price) return null;

      return {
        source_url: item.url || `https://www.oneroof.co.nz/property/${Date.now()}`,
        address: item.address,
        suburb: extractSuburbFromAddress(item.address),
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
      console.error('Error processing OneRoof result:', error, item);
      return null;
    }
  }).filter(Boolean);
}

function extractSuburbFromAddress(address: string): string {
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
