
export interface SearchFilters {
  region: string;
  district: string;
  suburb: string;
  minPrice: string;
  maxPrice: string;
  minBeds: string;
  maxBeds: string;
  minBaths: string;
  maxBaths: string;
  propertyType: string;
  keywords: string;
  selectedSources: string[];
  searchNearbySuburbs: boolean;
  openHomesOnly: boolean;
  newHomesOnly: boolean;
}

export interface PropertySearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
}
