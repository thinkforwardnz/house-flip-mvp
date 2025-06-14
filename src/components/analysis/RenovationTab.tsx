
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wrench } from 'lucide-react';
import type { Deal } from '@/types/analysis';
import type { RenovationSelections } from '@/types/renovation';
import RenovationSelector from './RenovationSelector';
import { calculateTotalRenovationCost } from '@/utils/arvCalculation';
import { useDeals } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast';

interface RenovationTabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  renovationEstimate: number;
  onDealUpdate: (updates: Partial<Deal>) => void;
}

const RenovationTab = ({ deal, formatCurrency, renovationEstimate, onDealUpdate }: RenovationTabProps) => {
  const { updateDeal } = useDeals();
  const { toast } = useToast();
  
  // Use market analysis for base value, fallback to target_sale_price or current_price
  const baseMarketValue = deal.market_analysis?.analysis?.estimated_arv || 
                         deal.target_sale_price || 
                         deal.current_price ||
                         0;
                         
  const renovationSelections = (deal.renovation_selections as RenovationSelections) || {};
  const totalSelectedCost = calculateTotalRenovationCost(renovationSelections);

  const handleRenovationSelectionsChange = async (selections: RenovationSelections) => {
    console.log('Saving renovation selections:', selections);
    
    try {
      // Update the deal in the database
      await updateDeal({
        id: deal.id,
        renovation_selections: selections
      });
      
      // Also update the local state
      onDealUpdate({
        renovation_selections: selections
      });
      
      console.log('Renovation selections saved successfully');
    } catch (error) {
      console.error('Failed to save renovation selections:', error);
      toast({
        title: "Error",
        description: "Failed to save renovation selections. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <RenovationSelector
        renovationSelections={renovationSelections}
        onRenovationChange={handleRenovationSelectionsChange}
        formatCurrency={formatCurrency}
        baseMarketValue={baseMarketValue}
      />

      {/* Cost Summary */}
      <div className="bg-gray-50 p-6 rounded-xl">
        <h4 className="font-medium text-navy-dark mb-4">Cost Summary</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="selected-reno-cost">Selected Renovations Total</Label>
            <Input 
              id="selected-reno-cost"
              type="number" 
              value={totalSelectedCost}
              readOnly
              className="mt-1 font-medium"
            />
          </div>
          <div>
            <Label htmlFor="contingency">Contingency Buffer (15%)</Label>
            <Input 
              id="contingency"
              type="number" 
              value={Math.round(totalSelectedCost * 0.15)}
              readOnly
              className="mt-1 bg-gray-50"
            />
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">Total with Contingency</p>
            <p className="text-lg font-bold text-green-900">
              {formatCurrency(totalSelectedCost * 1.15)}
            </p>
          </div>
        </div>
      </div>

      {/* Legacy renovation analysis display if available */}
      {deal.renovation_analysis?.recommendations && (
        <div className="bg-orange-50 p-4 rounded-xl">
          <h4 className="font-semibold text-orange-900 mb-3">AI Renovation Recommendations</h4>
          <div className="space-y-2">
            {deal.renovation_analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-orange-800">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RenovationTab;
