
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EnrichmentProgress {
  enriched: number;
  skipped: number;
  total: number;
  currentProperty?: string;
}

export const usePropertyEnrichment = () => {
  const [isEnriching, setIsEnriching] = useState(false);
  const [progress, setProgress] = useState<EnrichmentProgress>({
    enriched: 0,
    skipped: 0,
    total: 0
  });
  const { toast } = useToast();

  const startEnrichment = async () => {
    setIsEnriching(true);
    setProgress({ enriched: 0, skipped: 0, total: 0 });

    try {
      console.log('Starting property data enrichment...');

      const { data, error } = await supabase.functions.invoke('enrich-property-data', {
        body: {}
      });

      if (error) {
        console.error('Enrichment error:', error);
        throw error;
      }

      console.log('Enrichment response:', data);

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
      console.error('Error during enrichment:', error);
      toast({
        title: "Enrichment Error",
        description: error.message || "Failed to start property enrichment",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsEnriching(false);
    }
  };

  const cancelEnrichment = () => {
    setIsEnriching(false);
    setProgress({ enriched: 0, skipped: 0, total: 0 });
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
