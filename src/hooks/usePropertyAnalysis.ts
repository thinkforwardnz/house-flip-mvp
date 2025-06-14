
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import type { Deal } from '@/types/analysis';

export const usePropertyAnalysis = (deal: Deal, onUpdateDeal: (updates: any) => void) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const { toast } = useToast();

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  }, []);

  const getAnalysisProgress = useCallback(() => {
    let progress = 0;
    let completed: string[] = [];
    let pending: string[] = [];

    if (deal.address) {
      progress += 15;
      completed.push('Property Identification');
    } else {
      pending.push('Property Identification');
    }

    if (deal.purchase_price) {
      progress += 15;
      completed.push('Initial Pricing');
    } else {
      pending.push('Initial Pricing');
    }

    if (deal.target_sale_price) {
      progress += 20;
      completed.push('ARV Estimation');
    } else {
      pending.push('ARV Estimation');
    }

    if (deal.market_analysis?.analysis) {
      progress += 15;
      completed.push('Market Analysis');
    } else {
      pending.push('Market Analysis');
    }

    if (deal.renovation_analysis?.total_cost) { // Check actual total_cost if available
      progress += 15;
      completed.push('Renovation Costing');
    } else {
      pending.push('Renovation Costing');
    }

    if (deal.risk_assessment?.overall_risk_score) {
      progress += 20;
      completed.push('Risk Assessment');
    } else {
      pending.push('Risk Assessment');
    }

    return { progress: Math.min(100, progress), completed, pending };
  }, [deal]);

  const { progress, completed, pending } = getAnalysisProgress();

  const renovationEstimate = deal.renovation_analysis?.total_cost || 
    (deal.target_sale_price && deal.purchase_price 
      ? Math.max(0, (deal.target_sale_price - deal.purchase_price) * 0.15) 
      : 50000);

  const offerPrice = deal.target_sale_price 
    ? deal.target_sale_price - renovationEstimate - (deal.target_sale_price * 0.1) - (deal.target_sale_price * 0.15)
    : 0;

  const getDataSourceStatus = useCallback(() => {
    return {
      linz: { status: 'complete', icon: CheckCircle, color: 'text-green-600' }, // Assuming LINZ data is always foundational
      trademe: deal.photos && deal.photos.length > 0 ? 
        { status: 'complete', icon: CheckCircle, color: 'text-green-600' } :
        { status: 'pending', icon: AlertTriangle, color: 'text-yellow-600' },
      googleMaps: deal.coordinates ? 
        { status: 'complete', icon: CheckCircle, color: 'text-green-600' } :
        { status: 'pending', icon: AlertTriangle, color: 'text-yellow-600' },
      council: { status: 'pending', icon: AlertTriangle, color: 'text-gray-600' } // Example, adjust based on actual data
    };
  }, [deal.photos, deal.coordinates]);

  const dataSourceStatus = getDataSourceStatus();

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
        // Continue with analysis even if enrichment fails as some steps might not depend on it
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

      // Fetch updated deal data
      setAnalysisStep('Finalizing analysis...');
      const { data: updatedDeal, error: fetchError } = await supabase
        .from('deals')
        .select('*') // Consider a more specific select if possible
        .eq('id', deal.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated deal:', fetchError);
        throw new Error('Failed to fetch updated deal data');
      }
      
      if (updatedDeal) {
        onUpdateDeal(updatedDeal); // Call the prop to update the deal in the parent state
      }

      toast({
        title: "Analysis Complete",
        description: "Property analysis has been completed successfully.",
      });

      console.log('Analysis completed successfully for deal:', deal.id);
      
    } catch (error: any) {
      console.error('Analysis failed:', error);
      toast({
        title: "Analysis Failed",
        description: error.message || "An error occurred during analysis.",
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

