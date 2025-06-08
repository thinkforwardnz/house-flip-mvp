import { ScrapingFilters } from './types.ts';

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

// Wellington suburbs (keeping existing list)
const wellingtonSuburbs = [
  'Wellington Central', 'Kelburn', 'Mount Victoria', 'Thorndon', 'Te Aro', 'Newtown', 'Island Bay',
  'Petone', 'Lower Hutt', 'Wainuiomata', 'Eastbourne', 'Stokes Valley',
  'Upper Hutt', 'Totara Park', 'Heretaunga', 'Trentham',
  'Porirua', 'Whitby', 'Paremata', 'Plimmerton',
  'Paraparaumu', 'Waikanae', 'Otaki'
];

// Canterbury suburbs for Ashburton
const ashburtonSuburbs = [
  'Ashburton', 'Tinwald', 'Allenton', 'Netherby', 'Rakaia', 'Methven', 'Mayfield'
];

// All suburbs by region/district
const suburbsByDistrict: { [key: string]: string[] } = {
  'Wellington City': wellingtonSuburbs.filter(s => 
    ['Wellington Central', 'Kelburn', 'Mount Victoria', 'Thorndon', 'Te Aro', 'Newtown', 'Island Bay'].includes(s)
  ),
  'Lower Hutt City': wellingtonSuburbs.filter(s => 
    ['Petone', 'Lower Hutt', 'Wainuiomata', 'Eastbourne', 'Stokes Valley'].includes(s)
  ),
  'Upper Hutt City': wellingtonSuburbs.filter(s => 
    ['Upper Hutt', 'Totara Park', 'Heretaunga', 'Trentham'].includes(s)
  ),
  'Porirua City': wellingtonSuburbs.filter(s => 
    ['Porirua', 'Whitby', 'Paremata', 'Plimmerton'].includes(s)
  ),
  'Kapiti Coast District': wellingtonSuburbs.filter(s => 
    ['Paraparaumu', 'Waikanae', 'Otaki'].includes(s)
  ),
  'Ashburton District': ashburtonSuburbs
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
      
      // Add suburb if specified and valid for the district
      if (filters.suburb) {
        const validSuburbs = suburbsByDistrict[filters.district] || [];
        if (validSuburbs.includes(filters.suburb)) {
          const suburbSlug = filters.suburb.toLowerCase()
            .replace(/ /g, '-')
            .replace(/'/g, '');
          baseUrl += `/${suburbSlug}`;
        }
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
  
  const queryString = params.toString();
  const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  
  console.log('Built TradeMe URL:', finalUrl);
  return finalUrl;
}

export function extractSuburb(address: string): string {
  // Check all suburbs from all districts
  for (const district in suburbsByDistrict) {
    for (const suburb of suburbsByDistrict[district]) {
      if (address.toLowerCase().includes(suburb.toLowerCase())) {
        return suburb;
      }
    }
  }
  
  // Fallback to checking original Wellington suburbs list
  for (const suburb of wellingtonSuburbs) {
    if (address.toLowerCase().includes(suburb.toLowerCase())) {
      return suburb;
    }
  }
  
  return 'Unknown';
}
