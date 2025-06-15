
// TradeMe URL building and parsing utilities

// Local type definition to avoid import issues in edge functions
interface ScrapingFilters {
  region?: string;
  district?: string;
  suburb?: string;
  minPrice?: string;
  maxPrice?: string;
  minBeds?: string;
  maxBeds?: string;
  minBaths?: string;
  maxBaths?: string;
  propertyType?: string;
  keywords?: string;
  selectedSources?: string[];
  searchNearbySuburbs?: boolean;
  openHomesOnly?: boolean;
  newHomesOnly?: boolean;
}

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

// Reverse mappings for URL parsing
const urlToRegionMappings: { [key: string]: string } = Object.fromEntries(
  Object.entries(regionMappings).map(([key, value]) => [value, key])
);

const urlToDistrictMappings: { [key: string]: string } = {
  // Wellington districts
  'wellington-city': 'Wellington City',
  'hutt-city': 'Lower Hutt City',
  'lower-hutt': 'Lower Hutt City',
  'upper-hutt-city': 'Upper Hutt City',
  'upper-hutt': 'Upper Hutt City',
  'porirua-city': 'Porirua City',
  'porirua': 'Porirua City',
  'kapiti-coast': 'Kapiti Coast District',
  'south-wairarapa': 'South Wairarapa District',
  'carterton': 'Carterton District',
  'masterton': 'Masterton District',
  
  // Canterbury districts
  'christchurch-city': 'Christchurch City',
  'christchurch': 'Christchurch City',
  'selwyn': 'Selwyn District',
  'waimakariri': 'Waimakariri District',
  'ashburton': 'Ashburton District',
  'timaru': 'Timaru District',
  'mackenzie': 'Mackenzie District',
  'waimate': 'Waimate District',
  'hurunui': 'Hurunui District',
  'kaikoura': 'Kaikoura District',
  
  // Auckland districts
  'auckland': 'Auckland Council'
};

export function parseLocationFromTradeMeUrl(url: string): { suburb: string | null; city: string | null; district: string | null } {
  try {
    console.log('Parsing TradeMe URL:', url);
    
    // Extract the path from URL
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(part => part.length > 0);
    
    // TradeMe URL structure: /a/property/residential/sale/[region]/[district]/[suburb]/listing/[id]
    // Find the index of 'sale' to know where location data starts
    const saleIndex = pathParts.indexOf('sale');
    if (saleIndex === -1 || pathParts.length < saleIndex + 4) {
      console.log('URL does not contain expected structure');
      return { suburb: null, city: null, district: null };
    }
    
    const regionSlug = pathParts[saleIndex + 1];
    const districtSlug = pathParts[saleIndex + 2];
    const suburbSlug = pathParts[saleIndex + 3];
    
    console.log('URL segments:', { regionSlug, districtSlug, suburbSlug });
    
    // Convert URL slugs back to proper names
    const region = urlToRegionMappings[regionSlug] || null;
    const district = urlToDistrictMappings[districtSlug] || null;
    
    // Convert suburb slug to proper name (capitalize and replace hyphens with spaces)
    const suburb = suburbSlug 
      ? suburbSlug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : null;
    
    const result = {
      suburb: suburb,
      city: region, // In NZ, the region is often the main city
      district: district
    };
    
    console.log('Parsed location result:', result);
    return result;
    
  } catch (error) {
    console.error('Error parsing TradeMe URL:', error);
    return { suburb: null, city: null, district: null };
  }
}

export function buildTradeeMeSearchUrl(filters: ScrapingFilters): string {
  console.log('Building URL with filters:', JSON.stringify(filters, null, 2));
  
  // Start with base TradeMe property URL
  let baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale';
  
  // Add region if specified
  if (filters.region && regionMappings[filters.region]) {
    const regionSlug = regionMappings[filters.region];
    baseUrl += `/${regionSlug}`;
    console.log(`Added region: ${filters.region} -> ${regionSlug}`);
    
    // Add district if specified
    if (filters.district && districtMappings[filters.district]) {
      const districtSlug = districtMappings[filters.district];
      baseUrl += `/${districtSlug}`;
      console.log(`Added district: ${filters.district} -> ${districtSlug}`);
      
      // Add suburb if specified
      if (filters.suburb && filters.suburb.trim()) {
        const suburbSlug = filters.suburb.toLowerCase()
          .replace(/ /g, '-')
          .replace(/'/g, '')
          .replace(/[^a-z0-9-]/g, '');
        if (suburbSlug) {
          baseUrl += `/${suburbSlug}`;
          console.log(`Added suburb: ${filters.suburb} -> ${suburbSlug}`);
        }
      }
    }
  }
  
  const params = new URLSearchParams();
  
  // Handle search keywords (flip-related terms) - only add if provided
  if (filters.keywords && filters.keywords.trim()) {
    const keywords = filters.keywords.split(',').map((k: string) => k.trim()).filter(k => k);
    if (keywords.length > 0) {
      params.append('search_string', keywords[0]);
      console.log(`Added keywords: ${keywords[0]}`);
    }
  }
  
  // Handle price filters
  if (filters.minPrice && filters.minPrice.trim()) {
    const minPrice = parseInt(filters.minPrice.toString().replace(/[^0-9]/g, ''));
    if (minPrice > 0) {
      params.append('price_min', minPrice.toString());
      console.log(`Added min price: ${minPrice}`);
    }
  }
  
  if (filters.maxPrice && filters.maxPrice.trim()) {
    const maxPrice = parseInt(filters.maxPrice.toString().replace(/[^0-9]/g, ''));
    if (maxPrice > 0) {
      params.append('price_max', maxPrice.toString());
      console.log(`Added max price: ${maxPrice}`);
    }
  }
  
  // Handle bedroom filters
  if (filters.minBeds && filters.minBeds.trim()) {
    const minBeds = filters.minBeds.replace('+', '');
    if (minBeds !== 'Any' && minBeds !== 'any') {
      params.append('bedrooms_min', minBeds);
      console.log(`Added min beds: ${minBeds}`);
    }
  }
  
  if (filters.maxBeds && filters.maxBeds.trim()) {
    const maxBeds = filters.maxBeds.replace('+', '');
    if (maxBeds !== 'Any' && maxBeds !== 'any') {
      params.append('bedrooms_max', maxBeds);
      console.log(`Added max beds: ${maxBeds}`);
    }
  }
  
  // Handle bathroom filters
  if (filters.minBaths && filters.minBaths.trim()) {
    const minBaths = filters.minBaths.replace('+', '');
    if (minBaths !== 'Any' && minBaths !== 'any') {
      params.append('bathrooms_min', minBaths);
      console.log(`Added min baths: ${minBaths}`);
    }
  }
  
  if (filters.maxBaths && filters.maxBaths.trim()) {
    const maxBaths = filters.maxBaths.replace('+', '');
    if (maxBaths !== 'Any' && maxBaths !== 'any') {
      params.append('bathrooms_max', maxBaths);
      console.log(`Added max baths: ${maxBaths}`);
    }
  }
  
  // Build final URL
  const queryString = params.toString();
  const finalUrl = queryString ? `${baseUrl}?${queryString}` : baseUrl;
  
  console.log('Built TradeMe URL:', finalUrl);
  
  // Validate URL format
  try {
    new URL(finalUrl);
    console.log('URL validation: PASSED');
  } catch (error) {
    console.error('URL validation: FAILED', error);
    throw new Error(`Invalid URL generated: ${finalUrl}`);
  }
  
  return finalUrl;
}
