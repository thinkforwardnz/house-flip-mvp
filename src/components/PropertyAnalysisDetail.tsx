import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, AlertTriangle } from 'lucide-react';
import AIAnalysisSummary from '@/components/AIAnalysisSummary';
import PropertyHeader from '@/components/analysis/PropertyHeader';
import OverviewTab from '@/components/analysis/OverviewTab';
import DataCollectionTab from '@/components/analysis/DataCollectionTab';
import CMATab from '@/components/analysis/CMATab';
import RenovationTab from '@/components/analysis/RenovationTab';
import OfferTab from '@/components/analysis/OfferTab';
import RiskTab from '@/components/analysis/RiskTab';
import type { Deal } from '@/types/analysis';

interface PropertyAnalysisDetailProps {
  deal: Deal;
  onUpdateDeal: (updates: any) => void;
}

const PropertyAnalysisDetail = ({ deal, onUpdateDeal }: PropertyAnalysisDetailProps) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const { toast } = useToast();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getAnalysisProgress = () => {
    let progress = 0;
    let completed = [];
    let pending = [];

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

    if (deal.renovation_analysis?.total_cost) {
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

    return { progress, completed, pending };
  };

  const { progress, completed, pending } = getAnalysisProgress();

  const renovationEstimate = deal.renovation_analysis?.total_cost || 
    (deal.target_sale_price && deal.purchase_price 
      ? Math.max(0, (deal.target_sale_price - deal.purchase_price) * 0.15) 
      : 50000);

  const offerPrice = deal.target_sale_price 
    ? deal.target_sale_price - renovationEstimate - (deal.target_sale_price * 0.1) - (deal.target_sale_price * 0.15)
    : 0;

  const getDataSourceStatus = () => {
    return {
      linz: { status: 'complete', icon: CheckCircle, color: 'text-green-600' },
      trademe: deal.photos?.length > 0 ? 
        { status: 'complete', icon: CheckCircle, color: 'text-green-600' } :
        { status: 'pending', icon: AlertTriangle, color: 'text-yellow-600' },
      googleMaps: deal.coordinates ? 
        { status: 'complete', icon: CheckCircle, color: 'text-green-600' } :
        { status: 'pending', icon: AlertTriangle, color: 'text-yellow-600' },
      council: { status: 'pending', icon: AlertTriangle, color: 'text-gray-600' }
    };
  };

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
        console.error('Property enrichment error:', enrichResponse.error);
        // Continue with analysis even if enrichment fails
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
        .select('*')
        .eq('id', deal.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated deal:', fetchError);
        throw new Error('Failed to fetch updated deal data');
      }

      // Update the deal in the parent component
      onUpdateDeal(updatedDeal);

      toast({
        title: "Analysis Complete",
        description: "Property analysis has been completed successfully.",
      });

      console.log('Analysis completed successfully for deal:', deal.id);
      
    } catch (error) {
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

  const handleDealUpdate = (updatedDeal: Deal) => {
    onUpdateDeal(updatedDeal);
  };

  const handlePartialDealUpdate = (updates: Partial<Deal>) => {
    const updatedDeal = { ...deal, ...updates };
    onUpdateDeal(updatedDeal);
  };

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <PropertyHeader
        deal={deal}
        isAnalyzing={isAnalyzing}
        analysisStep={analysisStep}
        progress={progress}
        completed={completed}
        pending={pending}
        onRunAnalysis={handleRunAnalysis}
      />

      {/* Analysis Tabs */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="data">Data Collection</TabsTrigger>
              <TabsTrigger value="cma">Market Analysis</TabsTrigger>
              <TabsTrigger value="renovation">Renovation</TabsTrigger>
              <TabsTrigger value="offer">Offer Calculation</TabsTrigger>
              <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <OverviewTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate}
                offerPrice={offerPrice}
              />
            </TabsContent>

            <TabsContent value="data">
              <DataCollectionTab
                dataSourceStatus={dataSourceStatus}
                isAnalyzing={isAnalyzing}
                onRunAnalysis={handleRunAnalysis}
              />
            </TabsContent>

            <TabsContent value="cma">
              <CMATab 
                deal={deal} 
                formatCurrency={formatCurrency}
                onDealUpdate={handleDealUpdate}
              />
            </TabsContent>

            <TabsContent value="renovation">
              <RenovationTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate}
                onDealUpdate={handlePartialDealUpdate}
              />
            </TabsContent>

            <TabsContent value="offer">
              <OfferTab
                deal={deal}
                formatCurrency={formatCurrency}
                renovationEstimate={renovationEstimate}
                offerPrice={offerPrice}
              />
            </TabsContent>

            <TabsContent value="risk">
              <RiskTab deal={deal} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* AI Analysis Summary - Now Text-Based */}
      <AIAnalysisSummary deal={deal} />
    </div>
  );
};

export default PropertyAnalysisDetail;
