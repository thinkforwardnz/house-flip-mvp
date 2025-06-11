
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnrichmentResult {
  success: boolean;
  propertyId?: string;
  enriched_data?: {
    bedrooms?: number;
    bathrooms?: number;
    floor_area?: number;
    land_area?: number;
    photos_count?: number;
    has_description?: boolean;
  };
  message?: string;
  error?: string;
}

export const usePropertyEnrichment = () => {
  const [isEnriching, setIsEnriching] = useState(false);
  const { toast } = useToast();

  const enrichProperty = async (propertyId: string): Promise<EnrichmentResult> => {
    setIsEnriching(true);

    try {
      console.log('Starting unified property enrichment for property:', propertyId);

      const { data, error } = await supabase.functions.invoke('unified-data-processor', {
        body: { 
          mode: 'enrich',
          propertyId: propertyId
        }
      });

      if (error) {
        console.error('Property enrichment error:', error);
        throw error;
      }

      console.log('Property enrichment response:', data);

      if (data.success) {
        toast({
          title: "Property Enriched",
          description: data.message || "Property has been enriched with detailed information",
        });
      } else {
        toast({
          title: "Enrichment Failed",
          description: data.errors?.[0] || "Failed to enrich property data",
          variant: "destructive",
        });
      }

      return {
        success: data.success,
        propertyId: propertyId,
        message: data.message,
        enriched_data: {
          photos_count: 0,
          has_description: data.processed > 0
        }
      };
    } catch (error: any) {
      console.error('Error during property enrichment:', error);
      const errorResult: EnrichmentResult = {
        success: false,
        error: error.message || "Failed to enrich property"
      };
      
      toast({
        title: "Enrichment Error",
        description: errorResult.error,
        variant: "destructive",
      });
      
      return errorResult;
    } finally {
      setIsEnriching(false);
    }
  };

  return {
    isEnriching,
    enrichProperty,
  };
};
