
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
      console.log('Starting property enrichment for unified property:', propertyId);

      // Get the property from unified_properties table
      const { data: property, error: fetchError } = await supabase
        .from('unified_properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (fetchError || !property) {
        throw new Error('Property not found in unified properties');
      }

      // Call the enrichment function with the property data
      const { data, error } = await supabase.functions.invoke('enrich-property-data', {
        body: { 
          propertyId: property.id,
          propertyData: property
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
          description: data.error || "Failed to enrich property data",
          variant: "destructive",
        });
      }

      return data;
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
