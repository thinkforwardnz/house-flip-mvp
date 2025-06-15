
import { ScrapingFilters } from '../../scrape-trademe/types.ts';

// Region to TradeMe URL mapping
const regionMappings: { [key: string]: string } = {
  'Wellington': 'wellington',
  'Auckland': 'auckland',
  'Canterbury': 'canterbury',
  'Bay of Plenty': 'bay-of-plenty',
  'Waikato': 'waikato',
  'Otago': 'otago',
  'Manawatu-Wanganui': 'manawatu-wanganui',
  'Northland': 'northland',
  'Hawke\'s Bay': 'hawkes-bay',
  'Taranaki': 'taranaki',
  'Nelson': 'nelson',
  'Marlborough': 'marlborough',
  'Southland': 'southland',
  'Tasman': 'tasman',
  'Gisborne': 'gisborne',
  'West Coast': 'west-coast'
};

// District to TradeMe URL mapping
const districtMappings: { [key: string]: string } = {
  // Wellington districts
  'Wellington City': 'wellington-city',
  'Lower Hutt City': 'hutt-city',
  'Upper Hutt City': 'upper-hutt-city',
  'Porirua City': 'porirua-city',
  'Kapiti Coast District': 'kapiti-coast',
  'South Wairarapa District': 'south-wairarapa',
  'Carterton District': 'carterton',
  'Masterton District': 'masterton',
  
  // Canterbury districts
  'Christchurch City': 'christchurch-city',
  'Selwyn District': 'selwyn',
  'Waimakariri District': 'waimakariri',
  'Ashburton District': 'ashburton',
  'Timaru District': 'timaru',
  'Mackenzie District': 'mackenzie',
  'Waimate District': 'waimate',
  'Hurunui District': 'hurunui',
  'Kaikoura District': 'kaikoura',
  
  // Auckland districts
  'Auckland Council': 'auckland'
};

export function buildTradeeMeSearchUrl(filters: ScrapingFilters): string {
  // Start with base TradeMe property URL
  let baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale';
  
  // Add region if specified
  if (filters.region && regionMappings[filters.region]) {
    baseUrl += `/${regionMappings[filters.region]}`;
    
    // Add district if specified
    if (filters.district && districtMappings[filters.district]) {
      baseUrl += `/${districtMappings[filters.district]}`;
      
      // Add suburb if specified
      if (filters.suburb) {
        const suburbSlug = filters.suburb.toLowerCase()
          .replace(/ /g, '-')
          .replace(/'/g, '');
        baseUrl += `/${suburbSlug}`;
      }
    }
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
    const minPrice = parseInt(filters.minPrice.toString().replace(/[^0-9]/g, ''));
    if (minPrice > 0) {
      params.append('price_min', minPrice.toString());
    }
  }
  
  if (filters.maxPrice) {
    const maxPrice = parseInt(filters.maxPrice.toString().replace(/[^0-9]/g, ''));
    if (maxPrice > 0) {
      params.append('price_max', maxPrice.toString());
    }
  }
  
  // Handle bedroom filters
  if (filters.minBeds) {
    params.append('bedrooms_min', filters.minBeds.toString());
  }
  
  if (filters.maxBeds) {
    params.append('bedrooms_max', filters.maxBeds.toString());
  }
  
  // Handle bathroom filters
  if (filters.minBaths) {
    params.append('bathrooms_min', filters.minBaths.toString());
  }
  
  if (filters.maxBaths) {
    params.append('bathrooms_max', filters.maxBaths.toString());
  }
  
  const queryString = params.toString();
  const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  
  console.log('Built TradeMe URL:', finalUrl);
  return finalUrl;
}

export function parseAddress(address: string): { suburb: string | null; city: string | null; district: string | null } {
  const parts = address.split(',').map(part => part.trim());
  
  let suburb = null;
  let city = null;
  let district = null;

  if (parts.length >= 2) {
    suburb = parts[1];
  }
  if (parts.length >= 3) {
    district = parts[2];
  }
  
  if (address.toLowerCase().includes('wellington')) {
    city = 'Wellington';
  } else if (address.toLowerCase().includes('kapiti')) {
    city = 'Wellington';
    district = 'Kapiti Coast';
  } else if (address.toLowerCase().includes('canterbury') || address.toLowerCase().includes('christchurch')) {
    city = 'Christchurch';
  } else {
    city = 'Auckland';
  }

  return { suburb, city, district };
}

export function parsePrice(priceString: string): number {
  const matches = priceString.match(/\$?([\d,]+)/);
  if (matches) {
    return parseInt(matches[1].replace(/,/g, ''), 10);
  }
  return 0;
}

export function getPropertyFeatureValue(features: Array<{ label: string; value: string }>, label: string): string | null {
  if (!features) return null;
  const feature = features.find(f => f.label.toLowerCase().includes(label.toLowerCase()));
  return feature ? feature.value : null;
}
