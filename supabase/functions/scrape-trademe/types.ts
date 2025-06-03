
export interface ScrapingFilters {
  keywords?: string;
  minPrice?: string;
  maxPrice?: string;
  minBeds?: string;
  maxBeds?: string;
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

export interface CrawlResult {
  metadata?: { sourceURL?: string };
  url?: string;
  extract?: {
    address?: string;
    price?: string;
    bedrooms?: string;
    bathrooms?: string;
    floor_area?: string;
    land_area?: string;
    description?: string;
    summary?: string;
    photos?: string[];
  };
}
