
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  MapPin, 
  Calendar, 
  Ruler, 
  Home,
  DollarSign,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface CMATabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
}

const CMATab = ({ deal, formatCurrency }: CMATabProps) => {
  const [activeView, setActiveView] = useState('overview');

  // Calculate key metrics
  const analysis = deal.market_analysis?.analysis;
  const comparables = deal.market_analysis?.comparables || [];
  const pricePerSqm = analysis?.price_per_sqm || 0;
  const subjectPricePerSqm = deal.floor_area && analysis?.estimated_arv 
    ? analysis.estimated_arv / deal.floor_area 
    : 0;

  // Calculate price range based on comparables
  const calculatePriceRange = () => {
    if (comparables.length === 0) return { low: 0, high: 0, median: 0 };
    
    const prices = comparables
      .filter(comp => comp.sold_price)
      .map(comp => comp.sold_price!)
      .sort((a, b) => a - b);
    
    if (prices.length === 0) return { low: 0, high: 0, median: 0 };
    
    return {
      low: prices[0],
      high: prices[prices.length - 1],
      median: prices[Math.floor(prices.length / 2)]
    };
  };

  const priceRange = calculatePriceRange();

  // Calculate adjustments for each comparable
  const calculateAdjustments = (comp: any) => {
    const adjustments = {
      size: 0,
      condition: 0,
      location: 0,
      date: 0,
      total: 0
    };

    if (comp.floor_area && deal.floor_area) {
      const sizeDiff = comp.floor_area - deal.floor_area;
      adjustments.size = sizeDiff * (pricePerSqm || 5000); // Default $5k/sqm
    }

    // Date adjustment (assume 0.5% per month depreciation)
    if (comp.sold_date) {
      const monthsAgo = Math.floor((Date.now() - new Date(comp.sold_date).getTime()) / (1000 * 60 * 60 * 24 * 30));
      adjustments.date = (comp.sold_price || 0) * 0.005 * monthsAgo;
    }

    adjustments.total = adjustments.size + adjustments.condition + adjustments.location + adjustments.date;
    return adjustments;
  };

  const getMarketTrendIcon = () => {
    switch (analysis?.market_trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-navy-dark">Comparative Market Analysis (CMA)</h3>
        <Badge className={analysis?.market_confidence ? getConfidenceColor(analysis.market_confidence) : 'bg-gray-100 text-gray-800'}>
          {analysis?.market_confidence || 0}% Confidence
        </Badge>
      </div>

      <Tabs value={activeView} onValueChange={setActiveView} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subject">Subject Property</TabsTrigger>
          <TabsTrigger value="comparables">Comparables</TabsTrigger>
          <TabsTrigger value="analysis">Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Executive Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-900 flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Market Analysis Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-sm text-blue-700">Estimated Market Value</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv) : 'TBD'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-700">Price Range</p>
                  <p className="text-lg font-bold text-blue-900">
                    {priceRange.low > 0 ? `${formatCurrency(priceRange.low)} - ${formatCurrency(priceRange.high)}` : 'TBD'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-blue-700">Market Trend</p>
                  <div className="flex items-center justify-center gap-2">
                    {getMarketTrendIcon()}
                    <p className="text-lg font-bold text-blue-900 capitalize">
                      {analysis?.market_trend || 'TBD'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Ruler className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Price per m²</p>
                </div>
                <p className="text-xl font-bold text-navy-dark">
                  {subjectPricePerSqm > 0 ? `$${Math.round(subjectPricePerSqm).toLocaleString()}` : 'TBD'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Days on Market</p>
                </div>
                <p className="text-xl font-bold text-navy-dark">
                  {analysis?.avg_days_on_market || 'TBD'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Building className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Comparables</p>
                </div>
                <p className="text-xl font-bold text-navy-dark">
                  {comparables.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-gray-600" />
                  <p className="text-sm text-gray-600">Rental Yield</p>
                </div>
                <p className="text-xl font-bold text-navy-dark">
                  {analysis?.rental_yield ? `${analysis.rental_yield.toFixed(1)}%` : 'TBD'}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Market Insights */}
          {analysis?.insights && (
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-dark">Market Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-navy leading-relaxed">{analysis.insights}</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="subject" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-navy-dark flex items-center gap-2">
                <Home className="h-5 w-5" />
                Subject Property Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-navy-dark">Address:</span>
                    <span className="text-navy">{deal.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-navy-dark">Property Type:</span>
                    <span className="text-navy">Residential House</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="h-4 w-4 text-gray-600" />
                    <span className="font-medium text-navy-dark">Floor Area:</span>
                    <span className="text-navy">{deal.floor_area ? `${deal.floor_area}m²` : 'TBD'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-navy-dark">Bedrooms:</span>
                    <span className="text-navy">{deal.bedrooms || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-navy-dark">Bathrooms:</span>
                    <span className="text-navy">{deal.bathrooms || 'TBD'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-navy-dark">Land Area:</span>
                    <span className="text-navy">{deal.land_area ? `${deal.land_area}m²` : 'TBD'}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Photos */}
          {deal.photos && deal.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-dark">Property Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {deal.photos.slice(0, 6).map((photo, index) => (
                    <div key={index} className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photo} 
                        alt={`Property photo ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="comparables" className="space-y-6">
          {comparables.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-navy-dark">Comparable Sales with Adjustments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Property</TableHead>
                        <TableHead className="text-right">Sale Price</TableHead>
                        <TableHead className="text-right">Size (m²)</TableHead>
                        <TableHead className="text-right">$/m²</TableHead>
                        <TableHead className="text-right">Size Adj.</TableHead>
                        <TableHead className="text-right">Date Adj.</TableHead>
                        <TableHead className="text-right">Adjusted Price</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comparables.slice(0, 10).map((comp, index) => {
                        const adjustments = calculateAdjustments(comp);
                        const adjustedPrice = (comp.sold_price || 0) + adjustments.total;
                        const pricePerSqm = comp.floor_area && comp.sold_price 
                          ? comp.sold_price / comp.floor_area 
                          : 0;

                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-navy-dark">
                                  {comp.address || `Property ${index + 1}`}
                                </p>
                                <p className="text-sm text-gray-600">
                                  {comp.bedrooms}br, {comp.bathrooms}ba
                                  {comp.sold_date && ` • ${new Date(comp.sold_date).toLocaleDateString()}`}
                                </p>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {comp.sold_price ? formatCurrency(comp.sold_price) : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              {comp.floor_area || 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              {pricePerSqm > 0 ? `$${Math.round(pricePerSqm).toLocaleString()}` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={adjustments.size >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {adjustments.size !== 0 ? formatCurrency(Math.abs(adjustments.size)) : '-'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <span className={adjustments.date >= 0 ? 'text-green-600' : 'text-red-600'}>
                                {adjustments.date !== 0 ? formatCurrency(Math.abs(adjustments.date)) : '-'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right font-bold">
                              {formatCurrency(adjustedPrice)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                <h3 className="text-lg font-semibold text-navy-dark mb-2">No Comparable Sales Found</h3>
                <p className="text-navy mb-6">
                  Comparable sales data will be collected automatically during market analysis.
                </p>
                <Button className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Market Data
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          {/* Professional CMA Report */}
          <Card>
            <CardHeader>
              <CardTitle className="text-navy-dark">Professional Market Analysis Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Price Recommendation */}
              <div className="bg-green-50 p-4 rounded-xl">
                <h4 className="font-semibold text-green-900 mb-3">Price Recommendation</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-sm text-green-700">Conservative</p>
                    <p className="text-xl font-bold text-green-900">
                      {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv * 0.95) : 'TBD'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-700">Most Likely</p>
                    <p className="text-2xl font-bold text-green-900">
                      {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv) : 'TBD'}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-green-700">Optimistic</p>
                    <p className="text-xl font-bold text-green-900">
                      {analysis?.estimated_arv ? formatCurrency(analysis.estimated_arv * 1.05) : 'TBD'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Market Conditions */}
              <div>
                <h4 className="font-semibold text-navy-dark mb-3">Current Market Conditions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-navy">Market Trend:</span>
                      <div className="flex items-center gap-1">
                        {getMarketTrendIcon()}
                        <span className="font-medium capitalize">{analysis?.market_trend || 'Stable'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy">Average Days on Market:</span>
                      <span className="font-medium">{analysis?.avg_days_on_market || 'TBD'} days</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-navy">Inventory Level:</span>
                      <span className="font-medium">Moderate</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-navy">Price per m²:</span>
                      <span className="font-medium">
                        {pricePerSqm > 0 ? `$${Math.round(pricePerSqm).toLocaleString()}` : 'TBD'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Investment Timing */}
              <div>
                <h4 className="font-semibold text-navy-dark mb-3">Investment Timing Assessment</h4>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-blue-800">
                    Based on current market conditions and comparable sales analysis, this appears to be a 
                    {analysis?.market_trend === 'increasing' ? ' favorable' : analysis?.market_trend === 'declining' ? ' cautious' : 'n optimal'} 
                    time for property investment in {deal.suburb}. 
                    {analysis?.market_trend === 'increasing' && ' Rising market conditions suggest potential for capital growth.'}
                    {analysis?.market_trend === 'declining' && ' Declining market conditions require careful consideration of entry price.'}
                    {(!analysis?.market_trend || analysis?.market_trend === 'stable') && ' Stable market conditions provide predictable investment returns.'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CMATab;
