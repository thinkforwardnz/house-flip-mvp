
export interface ProcessingRequest {
  mode: 'scrape' | 'enrich' | 'refresh';
  filters?: any;
  propertyId?: string;
  sources?: string[];
}

export interface ProcessingResult {
  success: boolean;
  processed: number;
  skipped: number;
  errors: string[];
  message: string;
}

export interface PropertyProcessingResult {
  success: boolean;
  propertyId?: string;
  error?: string;
}
