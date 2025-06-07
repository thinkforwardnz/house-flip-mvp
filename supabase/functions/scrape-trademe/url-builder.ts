
import { ScrapingFilters } from './types.ts';

// Wellington suburbs from the Find page
const wellingtonSuburbs = [
  'Wellington Central', 'Kelburn', 'Mount Victoria', 'Thorndon', 'Te Aro', 'Newtown', 'Island Bay',
  'Petone', 'Lower Hutt', 'Wainuiomata', 'Eastbourne', 'Stokes Valley',
  'Upper Hutt', 'Totara Park', 'Heretaunga', 'Trentham',
  'Porirua', 'Whitby', 'Paremata', 'Plimmerton',
  'Paraparaumu', 'Waikanae', 'Otaki'
];

export function buildTradeeMeSearchUrl(filters: ScrapingFilters): string {
  let baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
  
  // Add suburb-specific path if specified
  if (filters.suburb && wellingtonSuburbs.includes(filters.suburb)) {
    const suburbSlug = filters.suburb.toLowerCase()
      .replace(/ /g, '-')
      .replace(/'/g, '');
    
    // Map some specific suburbs to their TradeMe paths
    const suburbMappings: { [key: string]: string } = {
      'wellington-central': 'wellington-city/wellington-central',
      'mount-victoria': 'wellington-city/mount-victoria',
      'kelburn': 'wellington-city/kelburn',
      'thorndon': 'wellington-city/thorndon',
      'te-aro': 'wellington-city/te-aro',
      'newtown': 'wellington-city/newtown',
      'island-bay': 'wellington-city/island-bay',
      'petone': 'hutt-city/petone',
      'lower-hutt': 'hutt-city/lower-hutt',
      'upper-hutt': 'upper-hutt-city/upper-hutt',
      'paraparaumu': 'kapiti-coast/paraparaumu',
      'waikanae': 'kapiti-coast/waikanae'
    };
    
    const mappedSuburb = suburbMappings[suburbSlug] || suburbSlug;
    baseUrl += `/${mappedSuburb}`;
  }
  
  const params = new URLSearchParams();
  
  // Handle search keywords (flip-related terms) - only add if provided
  if (filters.keywords && filters.keywords.trim()) {
    const keywords = filters.keywords.split(',').map((k: string) => k.trim());
    if (keywords.length > 0 && keywords[0]) {
      params.append('search_string', keywords[0]);
    }
  }
  
  // Handle price filters
  if (filters.minPrice) {
    const minPrice = parseInt(filters.minPrice.replace(/[^0-9]/g, ''));
    if (minPrice > 0) {
      params.append('price_min', minPrice.toString());
    }
  }
  
  if (filters.maxPrice) {
    const maxPrice = parseInt(filters.maxPrice.replace(/[^0-9]/g, ''));
    if (maxPrice > 0) {
      params.append('price_max', maxPrice.toString());
    }
  }
  
  // Handle bedroom filters
  if (filters.minBeds) {
    params.append('bedrooms_min', filters.minBeds);
  }
  
  if (filters.maxBeds) {
    params.append('bedrooms_max', filters.maxBeds);
  }
  
  // Handle bathroom filters
  if (filters.minBaths) {
    params.append('bathrooms_min', filters.minBaths);
  }
  
  if (filters.maxBaths) {
    params.append('bathrooms_max', filters.maxBaths);
  }
  
  // Add default sorting for best flip opportunities
  params.append('sort_order', 'price_asc'); // Lower prices first for flip potential
  
  const queryString = params.toString();
  const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  
  console.log('Built TradeMe URL:', finalUrl);
  return finalUrl;
}

export function extractSuburb(address: string): string {
  for (const suburb of wellingtonSuburbs) {
    if (address.toLowerCase().includes(suburb.toLowerCase())) {
      return suburb;
    }
  }
  return 'Wellington';
}
