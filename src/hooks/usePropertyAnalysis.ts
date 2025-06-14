
import { useState, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Deal } from '@/types/analysis';

import { formatCurrency } from '@/utils/formatCurrency';
import { calculateRenovationEstimate, calculateOfferPrice } from '@/utils/analysisCalculations';
import { getAnalysisProgress, getDataSourceStatus } from '@/utils/analysisStatus';
import {
  invokeMarketAnalysis,
  invokePropertyEnrichment,
  invokeRenovationAnalysis,
  invokeRiskAssessment,
  fetchFullyUpdatedDeal,
} from '@/services/propertyAnalysisService';

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
      const marketUpdates = await invokeMarketAnalysis({
        dealId: deal.id,
        address: deal.address || deal.property?.address,
        suburb: deal.suburb || deal.property?.suburb,
        city: deal.city || deal.property?.city,
        bedrooms: deal.bedrooms ?? deal.property?.bedrooms,
        bathrooms: deal.bathrooms ?? deal.property?.bathrooms,
      });
      if (Object.keys(marketUpdates).length > 0) onUpdateDeal(marketUpdates);

      // Step 2: Property Enrichment
      setAnalysisStep('Enriching property data...');
      const enrichmentUpdates = await invokePropertyEnrichment({
        dealId: deal.id,
        address: deal.address || deal.property?.address,
        coordinates: deal.coordinates || deal.property?.coordinates,
      });
      // Original logic allows this to fail softly, only update if data exists.
      if (Object.keys(enrichmentUpdates).length > 0) onUpdateDeal(enrichmentUpdates);

      // Step 3: Renovation Analysis
      setAnalysisStep('Analyzing renovation requirements...');
      const renovationUpdates = await invokeRenovationAnalysis({
        dealId: deal.id,
        photos: deal.photos || deal.property?.photos || [],
        propertyDescription: deal.description || deal.property?.description || '',
        bedrooms: deal.bedrooms ?? deal.property?.bedrooms,
        bathrooms: deal.bathrooms ?? deal.property?.bathrooms,
        floorArea: deal.floor_area ?? deal.property?.floor_area,
      });
      if (Object.keys(renovationUpdates).length > 0) onUpdateDeal(renovationUpdates);
      
      // Step 4: Risk Assessment
      setAnalysisStep('Performing risk assessment...');
      const riskUpdates = await invokeRiskAssessment({ dealId: deal.id });
      if (Object.keys(riskUpdates).length > 0) onUpdateDeal(riskUpdates);

      // Step 5: Fetch Final Data
      setAnalysisStep('Finalizing analysis and fetching latest data...');
      const finalDealData = await fetchFullyUpdatedDeal(deal.id);
      onUpdateDeal(finalDealData);

      toast({
        title: "Analysis Complete",
        description: "Property analysis has been completed successfully.",
      });
      console.log('Full analysis pipeline completed successfully for deal:', deal.id);
      
    } catch (error: any) {
      console.error('Full analysis pipeline failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during the analysis pipeline.",
        variant: "destructive",
      });
      // Special handling for fetchFullyUpdatedDeal error as per original logic
      if (error.message.startsWith("Could not fetch the very latest deal data")) {
         toast({
          title: "Data Sync Issue",
          description: "Could not fetch the very latest deal data after analysis, but analysis functions ran. Please refresh if needed.",
          variant: "default",
        });
      }
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
