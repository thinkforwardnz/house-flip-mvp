
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnrichmentProgress {
  enriched: number;
  skipped: number;
  total: number;
  currentProperty?: string;
}

const ENRICHMENT_STORAGE_KEY = 'property_enrichment_progress';
const ENRICHMENT_STATUS_KEY = 'property_enrichment_active';

export const usePropertyEnrichment = () => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState<EnrichmentProgress>({
    enriched: 0,
    skipped: 0,
    total: 0
  });
  const { toast } = useToast();

  // Load persistent state on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(ENRICHMENT_STORAGE_KEY);
    const savedStatus = localStorage.getItem(ENRICHMENT_STATUS_KEY);
    
    if (savedProgress) {
      try {
        const parsedProgress = JSON.parse(savedProgress);
        setProgress(parsedProgress);
      } catch (error) {
        console.error('Error parsing saved enrichment progress:', error);
      }
    }
    
    if (savedStatus === 'true') {
      setIsEnriching(true);
    }
  }, []);

  // Save state whenever it changes
  useEffect(() => {
    localStorage.setItem(ENRICHMENT_STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    localStorage.setItem(ENRICHMENT_STATUS_KEY, isEnriching.toString());
  }, [isEnriching]);

  const startEnrichment = async () => {
    setIsEnriching(true);
    setProgress({ enriched: 0, skipped: 0, total: 0 });

    try {
      console.log('Starting batch property enrichment...');

      // Use the existing enrich-property-data function for batch processing
      const { data, error } = await supabase.functions.invoke('enrich-property-data', {
        body: {}
      });

      if (error) {
        console.error('Batch enrichment error:', error);
        throw error;
      }

      console.log('Batch enrichment response:', data);

      setProgress({
        enriched: data.enriched || 0,
        skipped: data.skipped || 0,
        total: data.totalProcessed || 0
      });

      if (data.success) {
        toast({
          title: "Enrichment Complete",
          description: data.message || `Enriched ${data.enriched} properties`,
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
      console.error('Error during batch enrichment:', error);
      toast({
        title: "Enrichment Error",
        description: error.message || "Failed to start property enrichment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsEnriching(false);
      // Clear the persistent state when complete
      localStorage.removeItem(ENRICHMENT_STORAGE_KEY);
      localStorage.removeItem(ENRICHMENT_STATUS_KEY);
    }
  };

  const cancelEnrichment = () => {
    setIsEnriching(false);
    setProgress({ enriched: 0, skipped: 0, total: 0 });
    
    // Clear persistent state
    localStorage.removeItem(ENRICHMENT_STORAGE_KEY);
    localStorage.removeItem(ENRICHMENT_STATUS_KEY);
    
    toast({
      title: "Enrichment Cancelled",
      description: "Property data enrichment has been cancelled",
    });
  };

  return {
    isEnriching,
    progress,
    startEnrichment,
    cancelEnrichment,
  };
};
