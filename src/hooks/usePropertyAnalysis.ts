
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Deal } from '@/types/analysis';

import { formatCurrency } from '@/utils/formatCurrency';
import { calculateRenovationEstimate, calculateOfferPrice } from '@/utils/analysisCalculations';
import { getAnalysisProgress, getDataSourceStatus } from '@/utils/analysisStatus';

export const usePropertyAnalysis = (deal: Deal, onUpdateDeal: (updates: Partial<Deal>) => void) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const { toast } = useToast();

  const { progress, completed, pending } = useMemo(() => getAnalysisProgress(deal), [deal]);
  const renovationEstimate = useMemo(() => calculateRenovationEstimate(deal), [deal]);
  const offerPrice = useMemo(() => calculateOfferPrice(deal, renovationEstimate), [deal, renovationEstimate]);
  const dataSourceStatus = useMemo(() => getDataSourceStatus(deal), [deal]);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Step 1: Market Analysis
      setAnalysisStep('Running market analysis...');
      console.log('Starting market analysis for deal:', deal.id);
      
      const marketResponse = await supabase.functions.invoke('market-analysis', {
        body: {
          dealId: deal.id,
          address: deal.address,
          suburb: deal.suburb,
          city: deal.city,
          bedrooms: deal.bedrooms,
          bathrooms: deal.bathrooms
        }
      });

      if (marketResponse.error) {
        console.error('Market analysis error:', marketResponse.error);
        throw new Error(`Market analysis failed: ${marketResponse.error.message}`);
      }
      console.log('Market analysis response:', marketResponse.data);
      // Assuming marketResponse.data contains updates for the deal
      if (marketResponse.data) {
        onUpdateDeal(marketResponse.data);
      }


      // Step 2: Property Enrichment
      setAnalysisStep('Enriching property data...');
      console.log('Starting property enrichment for deal:', deal.id);
      
      const enrichResponse = await supabase.functions.invoke('enrich-property-analysis', {
        body: {
          dealId: deal.id,
          address: deal.address, // Ensure address is passed
          coordinates: deal.coordinates // Ensure coordinates are passed if available
        }
      });

      if (enrichResponse.error) {
        console.error('Property enrichment error:', enrichResponse.error.message);
        // Continue with analysis even if enrichment fails as some steps might not depend on it
        // Potentially toast a warning or non-critical error
      } else {
        console.log('Property enrichment response:', enrichResponse.data);
        if (enrichResponse.data) {
          onUpdateDeal(enrichResponse.data);
        }
      }

      // Step 3: Renovation Analysis
      setAnalysisStep('Analyzing renovation requirements...');
      console.log('Starting renovation analysis for deal:', deal.id);
      
      const renovationResponse = await supabase.functions.invoke('renovation-analysis', {
        body: {
          dealId: deal.id,
          photos: deal.photos || [],
          propertyDescription: deal.description || '',
          bedrooms: deal.bedrooms,
          bathrooms: deal.bathrooms,
          floorArea: deal.floor_area
        }
      });

      if (renovationResponse.error) {
        console.error('Renovation analysis error:', renovationResponse.error);
        throw new Error(`Renovation analysis failed: ${renovationResponse.error.message}`);
      }
      console.log('Renovation analysis response:', renovationResponse.data);
      if (renovationResponse.data) {
          onUpdateDeal(renovationResponse.data);
      }

      // Step 4: Risk Assessment
      setAnalysisStep('Performing risk assessment...');
      console.log('Starting risk assessment for deal:', deal.id);
      
      const riskResponse = await supabase.functions.invoke('risk-assessment', {
        body: {
          dealId: deal.id
          // Pass other relevant deal data if needed by the function
        }
      });

      if (riskResponse.error) {
        console.error('Risk assessment error:', riskResponse.error);
        throw new Error(`Risk assessment failed: ${riskResponse.error.message}`);
      }
      console.log('Risk assessment response:', riskResponse.data);
      if (riskResponse.data) {
        onUpdateDeal(riskResponse.data);
      }

      // Fetch updated deal data (or rely on onUpdateDeal to refresh if it does a full fetch)
      // Forcing a final fetch to ensure client state is fully synchronized with DB after all functions.
      setAnalysisStep('Finalizing analysis and fetching latest data...');
      const { data: updatedDeal, error: fetchError } = await supabase
        .from('deals')
        .select(`
          *,
          property_id (
            id,
            address,
            suburb,
            city,
            coordinates,
            photos,
            description,
            bedrooms,
            bathrooms,
            floor_area,
            land_area,
            year_built,
            current_price,
            listing_date,
            source_url,
            source_site,
            tags,
            status
          )
        `)
        .eq('id', deal.id)
        .single();

      if (fetchError) {
        console.error('Error fetching final updated deal:', fetchError);
        // Don't throw here, as previous steps might have partially succeeded.
        // The UI will reflect partial updates. Toast a warning.
        toast({
          title: "Data Sync Issue",
          description: "Could not fetch the very latest deal data after analysis, but analysis functions ran. Please refresh if needed.",
          variant: "default", // Not destructive, as analysis itself might be fine
        });
      } else if (updatedDeal) {
        onUpdateDeal(updatedDeal); // This ensures the parent component gets the fully updated deal
      }

      toast({
        title: "Analysis Complete",
        description: "Property analysis has been completed successfully.",
      });

      console.log('Analysis completed successfully for deal:', deal.id);
      
    } catch (error: any) {
      console.error('Full analysis pipeline failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during the analysis pipeline.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  return {
    isAnalyzing,
    analysisStep,
    handleRunAnalysis,
    formatCurrency, // Re-exporting the imported utility
    progress,
    completed,
    pending,
    renovationEstimate,
    offerPrice,
    dataSourceStatus,
  };
};
