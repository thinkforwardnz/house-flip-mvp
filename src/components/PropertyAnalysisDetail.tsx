import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  MapPin, 
  Home, 
  TrendingUp, 
  Calculator, 
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Eye,
  Building,
  DollarSign,
  Target,
  Wrench
} from 'lucide-react';

interface PropertyAnalysisDetailProps {
  deal: any;
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

    // Mock additional analysis steps
    progress += 15; // Data Collection (assume complete)
    completed.push('Data Collection');
    
    progress += 10; // CMA (assume partial)
    completed.push('Market Analysis');

    if (deal.current_profit > 0) {
      progress += 15;
      completed.push('Renovation Costing');
    } else {
      pending.push('Renovation Costing');
    }

    progress += 10; // Risk Assessment (assume partial)
    completed.push('Risk Assessment');

    return { progress, completed, pending };
  };

  const { progress, completed, pending } = getAnalysisProgress();

  const renovationEstimate = deal.target_sale_price && deal.purchase_price 
    ? Math.max(0, (deal.target_sale_price - deal.purchase_price) * 0.15) 
    : 50000;

  const offerPrice = deal.target_sale_price 
    ? deal.target_sale_price - renovationEstimate - (deal.target_sale_price * 0.1) - (deal.target_sale_price * 0.15)
    : 0;

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
          propertyDescription: deal.description || deal.summary,
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

  return (
    <div className="space-y-6">
      {/* Property Header */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-navy-dark mb-2">{deal.address}</h1>
              <div className="flex items-center text-navy mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {deal.suburb}, {deal.city}
              </div>
              <Badge className={`${
                deal.current_risk === 'low' ? 'bg-green-100 text-green-800' :
                deal.current_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              } rounded-lg`}>
                {deal.current_risk} Risk
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleRunAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
              <Button variant="outline" className="rounded-xl">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Show analysis progress */}
          {isAnalyzing && (
            <div className="bg-blue-50 p-4 rounded-xl mb-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{analysisStep}</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}

          {/* Progress Overview */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-navy-dark">Analysis Progress</h3>
              <span className="text-sm font-medium text-navy-dark">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3 mb-3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-green-600 mb-1">Completed ({completed.length})</p>
                <ul className="space-y-1">
                  {completed.map((item, index) => (
                    <li key={index} className="flex items-center text-green-700">
                      <CheckCircle className="h-3 w-3 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="font-medium text-orange-600 mb-1">Pending ({pending.length})</p>
                <ul className="space-y-1">
                  {pending.map((item, index) => (
                    <li key={index} className="flex items-center text-orange-700">
                      <AlertTriangle className="h-3 w-3 mr-2" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-blue-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <DollarSign className="h-5 w-5 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">Purchase Price</p>
                  </div>
                  <p className="text-xl font-bold text-blue-900">
                    {deal.purchase_price ? formatCurrency(deal.purchase_price) : 'TBD'}
                  </p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Target className="h-5 w-5 text-green-600" />
                    <p className="text-sm font-medium text-green-900">Target ARV</p>
                  </div>
                  <p className="text-xl font-bold text-green-900">
                    {deal.target_sale_price ? formatCurrency(deal.target_sale_price) : 'TBD'}
                  </p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <Wrench className="h-5 w-5 text-orange-600" />
                    <p className="text-sm font-medium text-orange-900">Est. Renovation</p>
                  </div>
                  <p className="text-xl font-bold text-orange-900">
                    {formatCurrency(renovationEstimate)}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    <p className="text-sm font-medium text-purple-900">Est. Profit</p>
                  </div>
                  <p className={`text-xl font-bold ${deal.current_profit > 0 ? 'text-purple-900' : 'text-gray-600'}`}>
                    {deal.current_profit > 0 ? formatCurrency(deal.current_profit) : 'TBD'}
                  </p>
                </div>
              </div>

              {/* Offer Scenarios */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-navy-dark mb-4">Offer Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-gray-200 rounded-xl p-4">
                    <h4 className="font-medium text-green-600 mb-2">Conservative</h4>
                    <p className="text-lg font-bold text-navy-dark">{formatCurrency(offerPrice * 0.9)}</p>
                    <p className="text-xs text-navy mt-1">Low risk, lower returns</p>
                  </div>
                  <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
                    <h4 className="font-medium text-blue-600 mb-2">Balanced</h4>
                    <p className="text-lg font-bold text-navy-dark">{formatCurrency(offerPrice)}</p>
                    <p className="text-xs text-navy mt-1">Recommended offer</p>
                  </div>
                  <div className="border border-orange-200 rounded-xl p-4">
                    <h4 className="font-medium text-orange-600 mb-2">Aggressive</h4>
                    <p className="text-lg font-bold text-navy-dark">{formatCurrency(offerPrice * 1.1)}</p>
                    <p className="text-xs text-navy mt-1">Higher risk, higher returns</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="data">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-navy-dark">Data Collection Status</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-navy-dark">Free Data Sources</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">LINZ Property Data</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-sm">Trade Me Listing</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">Google Maps Data</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-sm">Council GIS Data</span>
                        <AlertTriangle className="h-4 w-4 text-gray-600" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium text-navy-dark">Market Data Sources</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">homes.co.nz</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">OneRoof.co.nz</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <span className="text-sm">RealEstate.co.nz</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      </div>
                    </div>
                  </div>
                </div>

                <Button 
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl"
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  Refresh Data Collection
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="cma">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-navy-dark">Comparative Market Analysis</h3>
                
                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2">AVM Estimates</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-blue-700">HomesEstimate</p>
                      <p className="text-lg font-bold text-blue-900">TBD</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700">OneRoof AVM</p>
                      <p className="text-lg font-bold text-blue-900">TBD</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-blue-700">Council CV</p>
                      <p className="text-lg font-bold text-blue-900">TBD</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-navy-dark mb-3">Recent Comparable Sales</h4>
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    <p>Comparable sales data will be collected automatically</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="renovation">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-navy-dark">Renovation Cost Estimation</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-navy-dark mb-3">Room-by-Room Costs</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>Kitchen Renovation</span>
                        <span className="font-medium">$15,000 - $30,000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>Bathroom Renovation</span>
                        <span className="font-medium">$8,000 - $15,000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>Flooring (entire house)</span>
                        <span className="font-medium">$5,000 - $12,000</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span>Painting (interior/exterior)</span>
                        <span className="font-medium">$3,000 - $8,000</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-navy-dark mb-3">Cost Estimation</h4>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="reno-estimate">Total Renovation Estimate</Label>
                        <Input 
                          id="reno-estimate"
                          type="number" 
                          value={renovationEstimate}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contingency">Contingency Buffer (15%)</Label>
                        <Input 
                          id="contingency"
                          type="number" 
                          value={renovationEstimate * 0.15}
                          disabled
                          className="mt-1 bg-gray-50"
                        />
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm text-green-700">Total with Contingency</p>
                        <p className="text-lg font-bold text-green-900">
                          {formatCurrency(renovationEstimate * 1.15)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="offer">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-navy-dark">Offer Price Calculation</h3>
                
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h4 className="font-medium text-navy-dark mb-4">Back-calculation from ARV</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Target ARV:</span>
                      <span className="font-medium">{deal.target_sale_price ? formatCurrency(deal.target_sale_price) : 'TBD'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Less: Renovation Costs:</span>
                      <span className="font-medium text-red-600">-{formatCurrency(renovationEstimate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Less: Transaction Costs (10%):</span>
                      <span className="font-medium text-red-600">-{formatCurrency((deal.target_sale_price || 0) * 0.1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Less: Target Profit (15%):</span>
                      <span className="font-medium text-red-600">-{formatCurrency((deal.target_sale_price || 0) * 0.15)}</span>
                    </div>
                    <hr className="my-2" />
                    <div className="flex justify-between text-lg font-bold">
                      <span>Maximum Purchase Price:</span>
                      <span className="text-green-600">{formatCurrency(offerPrice)}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="border border-green-200 rounded-xl p-4 bg-green-50">
                    <h4 className="font-medium text-green-600 mb-2">Conservative Strategy</h4>
                    <p className="text-xl font-bold text-green-900">{formatCurrency(offerPrice * 0.9)}</p>
                    <p className="text-xs text-green-700 mt-2">90% of calculated max price</p>
                    <ul className="text-xs text-green-600 mt-2 space-y-1">
                      <li>• Lower risk</li>
                      <li>• Higher chance of acceptance</li>
                      <li>• Buffer for unexpected costs</li>
                    </ul>
                  </div>
                  
                  <div className="border border-blue-200 rounded-xl p-4 bg-blue-50">
                    <h4 className="font-medium text-blue-600 mb-2">Balanced Strategy</h4>
                    <p className="text-xl font-bold text-blue-900">{formatCurrency(offerPrice)}</p>
                    <p className="text-xs text-blue-700 mt-2">100% of calculated max price</p>
                    <ul className="text-xs text-blue-600 mt-2 space-y-1">
                      <li>• Calculated max price</li>
                      <li>• Target profit maintained</li>
                      <li>• Recommended approach</li>
                    </ul>
                  </div>
                  
                  <div className="border border-orange-200 rounded-xl p-4 bg-orange-50">
                    <h4 className="font-medium text-orange-600 mb-2">Aggressive Strategy</h4>
                    <p className="text-xl font-bold text-orange-900">{formatCurrency(offerPrice * 1.1)}</p>
                    <p className="text-xs text-orange-700 mt-2">110% of calculated max price</p>
                    <ul className="text-xs text-orange-600 mt-2 space-y-1">
                      <li>• Higher risk</li>
                      <li>• Reduced profit margin</li>
                      <li>• Competitive market strategy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="risk">
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-navy-dark">Risk Assessment</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-navy-dark mb-3">Market Risks</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Market Trends</span>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                        </div>
                        <p className="text-xs text-yellow-700">Market analysis needed</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Days on Market</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">Low</Badge>
                        </div>
                        <p className="text-xs text-green-700">Good sales velocity in area</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Rental Yield</span>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                        </div>
                        <p className="text-xs text-yellow-700">Analysis in progress</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-navy-dark mb-3">Property Risks</h4>
                    <div className="space-y-3">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Zoning Compliance</span>
                          <Badge className="bg-gray-100 text-gray-800 text-xs">Unknown</Badge>
                        </div>
                        <p className="text-xs text-gray-600">Council data required</p>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Structural Condition</span>
                          <Badge className="bg-green-100 text-green-800 text-xs">Low</Badge>
                        </div>
                        <p className="text-xs text-green-700">No obvious issues visible</p>
                      </div>
                      <div className="p-3 bg-yellow-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Renovation Complexity</span>
                          <Badge className="bg-yellow-100 text-yellow-800 text-xs">Medium</Badge>
                        </div>
                        <p className="text-xs text-yellow-700">Standard renovation scope</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl">
                  <h4 className="font-medium text-blue-900 mb-2">Overall Risk Score</h4>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <Progress value={60} className="h-3" />
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">Medium Risk</Badge>
                  </div>
                  <p className="text-sm text-blue-700 mt-2">
                    Overall risk is medium due to pending market analysis and zoning verification.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAnalysisDetail;
