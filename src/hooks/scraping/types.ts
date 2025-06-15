
export interface SourceProgress {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  scraped?: number;
  skipped?: number;
  error?: string;
}

export interface ScrapingFilters {
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
