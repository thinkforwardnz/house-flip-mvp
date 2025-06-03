import { ScrapingFilters } from './types.ts';

export function buildTradeeMeSearchUrl(baseUrl: string, filters: ScrapingFilters): string {
  const params = new URLSearchParams();
  
  // Handle keywords/search string
  if (filters.keywords) {
    // Take the first keyword if multiple are provided (separated by comma)
    const keywords = filters.keywords.split(',').map((k: string) => k.trim());
    const searchTerm = keywords[0] || '';
    if (searchTerm) {
      params.append('search_string', searchTerm);
    }
  }
  
  // Handle price filters
  if (filters.minPrice) params.append('price_min', filters.minPrice);
  if (filters.maxPrice) params.append('price_max', filters.maxPrice);
  
  // Handle bedroom filters
  if (filters.minBeds) params.append('bedrooms_min', filters.minBeds);
  if (filters.maxBeds) params.append('bedrooms_max', filters.maxBeds);
  
  // Handle suburb filter
  if (filters.suburb) {
    // TradeMe might handle suburb filtering differently, but we'll try this approach
    params.append('suburb', filters.suburb);
  }
  
  // If we have search parameters, use the /search endpoint
  if (params.toString()) {
    return `${baseUrl}/search?${params.toString()}`;
  }
  
  // Otherwise use the base URL
  return baseUrl;
}
