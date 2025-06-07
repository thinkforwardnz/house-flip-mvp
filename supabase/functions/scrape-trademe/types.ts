
export interface ScrapingFilters {
  keywords?: string;
  minPrice?: string;
  maxPrice?: string;
  minBeds?: string;
  maxBeds?: string;
  minBaths?: string;
  maxBaths?: string;
  suburb?: string;
}

export interface PropertyData {
  source_url: string;
  address: string;
  suburb: string;
  city: string;
  price: number;
  bedrooms: number | null;
  bathrooms: number | null;
  floor_area: number | null;
  land_area: number | null;
  summary: string;
  photos: string[];
  listing_date: string;
}

export interface AgentQLPropertyResult {
  title?: string;
  price?: string;
  address?: string;
  suburb?: string;
  bedrooms?: string;
  bathrooms?: string;
  floor_area?: string;
  land_area?: string;
  description?: string;
  listing_url?: string;
  photos?: string[];
  listing_date?: string;
}

export interface AgentQLResponse {
  property_listings?: AgentQLPropertyResult[];
  search_results?: {
    property_title?: string;
    property_price?: string;
    property_address?: string;
    property_link?: string;
    property_image?: string;
  }[];
}
