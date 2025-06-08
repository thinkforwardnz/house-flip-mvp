
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Building, RefreshCw } from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface CMAComparablesProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  comparables: any[];
  pricePerSqm: number;
}

const CMAComparables = ({ deal, formatCurrency, comparables, pricePerSqm }: CMAComparablesProps) => {
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

  if (comparables.length === 0) {
    return (
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
    );
  }

  return (
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
                const compPricePerSqm = comp.floor_area && comp.sold_price 
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
                      {compPricePerSqm > 0 ? `$${Math.round(compPricePerSqm).toLocaleString()}` : 'N/A'}
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
  );
};

export default CMAComparables;
