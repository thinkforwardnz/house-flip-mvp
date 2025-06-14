
import { useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Deal, MarketData, RenovationAnalysis, RiskAssessment, ListingDetails } from '@/types/analysis';

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
      // These updates are partial and might not be the full Deal type
      if (marketResponse.data && marketResponse.data.updatedFields) {
         // Ensure market_analysis is correctly typed if it's part of updatedFields
        const partialUpdates = { ...marketResponse.data.updatedFields };
        if (partialUpdates.market_analysis) {
          partialUpdates.market_analysis = partialUpdates.market_analysis as MarketData | undefined;
        }
        onUpdateDeal(partialUpdates);
      }


      // Step 2: Property Enrichment
      setAnalysisStep('Enriching property data...');
      console.log('Starting property enrichment for deal:', deal.id);
      
      const enrichResponse = await supabase.functions.invoke('enrich-property-analysis', {
        body: {
          dealId: deal.id,
          address: deal.address, 
          coordinates: deal.coordinates 
        }
      });

      if (enrichResponse.error) {
        console.error('Property enrichment error:', enrichResponse.error.message);
      } else {
        console.log('Property enrichment response:', enrichResponse.data);
        // enrichResponse.data might return { success: boolean, data: enrichedData, message: string }
        // Assuming enrichedData contains fields to update on the deal
        if (enrichResponse.data && enrichResponse.data.data) {
          // The actual enriched data is nested under `data` property from the function
          // This might be `analysis_data` or other specific fields.
          // If it's just `analysis_data`, then it should be:
          // onUpdateDeal({ analysis_data: enrichResponse.data.data });
          // For now, assuming it returns partial deal fields:
           onUpdateDeal(enrichResponse.data.data as Partial<Deal>);
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
      if (renovationResponse.data && renovationResponse.data.updatedFields) {
        const partialUpdates = { ...renovationResponse.data.updatedFields };
        if (partialUpdates.renovation_analysis) {
          partialUpdates.renovation_analysis = partialUpdates.renovation_analysis as RenovationAnalysis | undefined;
        }
        onUpdateDeal(partialUpdates);
      }

      // Step 4: Risk Assessment
      setAnalysisStep('Performing risk assessment...');
      console.log('Starting risk assessment for deal:', deal.id);
      
      const riskResponse = await supabase.functions.invoke('risk-assessment', {
        body: {
          dealId: deal.id
        }
      });

      if (riskResponse.error) {
        console.error('Risk assessment error:', riskResponse.error);
        throw new Error(`Risk assessment failed: ${riskResponse.error.message}`);
      }
      console.log('Risk assessment response:', riskResponse.data);
      if (riskResponse.data && riskResponse.data.updatedFields) {
        const partialUpdates = { ...riskResponse.data.updatedFields };
        if (partialUpdates.risk_assessment) {
          partialUpdates.risk_assessment = partialUpdates.risk_assessment as RiskAssessment | undefined;
        }
        onUpdateDeal(partialUpdates);
      }

      setAnalysisStep('Finalizing analysis and fetching latest data...');
      // Fetch the fully updated deal object to ensure client state is synchronized.
      const { data: fetchedDealData, error: fetchError } = await supabase
        .from('deals')
        .select(`
          *,
          property:unified_properties (
            address,
            suburb,
            city,
            bedrooms,
            bathrooms,
            floor_area,
            land_area,
            photos,
            description,
            coordinates
          )
        `)
        .eq('id', deal.id)
        .single();

      if (fetchError) {
        console.error('Error fetching final updated deal:', fetchError);
        toast({
          title: "Data Sync Issue",
          description: "Could not fetch the very latest deal data after analysis, but analysis functions ran. Please refresh if needed.",
          variant: "default",
        });
      } else if (fetchedDealData) {
        // Cast JSONB fields to their specific types
        const dealForUpdate: Partial<Deal> = {
          ...fetchedDealData,
          market_analysis: fetchedDealData.market_analysis as MarketData | undefined,
          renovation_analysis: fetchedDealData.renovation_analysis as RenovationAnalysis | undefined,
          risk_assessment: fetchedDealData.risk_assessment as RiskAssessment | undefined,
          listing_details: fetchedDealData.listing_details as ListingDetails | undefined,
          // analysis_data and renovation_selections are 'any' in Deal type, so direct assignment is okay.
          // If their types in Deal become more specific, they would need casting too.
          // The 'property' field should be correctly typed from the select query.
        };
        onUpdateDeal(dealForUpdate);
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
    formatCurrency,
    progress,
    completed,
    pending,
    renovationEstimate,
    offerPrice,
    dataSourceStatus,
  };
};
