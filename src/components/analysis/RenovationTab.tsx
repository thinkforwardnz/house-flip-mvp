
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
  renovationEstimate: number; // This prop might not be used directly if totalSelectedCost is calculated here
  onDealUpdate: (updates: Partial<Deal>) => void;
}

const RenovationTab = ({ deal, formatCurrency, /* renovationEstimate, */ onDealUpdate }: RenovationTabProps) => {
  const { updateDeal } = useDeals();
  const { toast } = useToast();
  
  const baseMarketValue = deal.market_analysis?.analysis?.estimated_arv || 
                         deal.target_sale_price || 
                         deal.purchase_price ||
                         0;
                         
  const renovationSelections = (deal.renovation_selections as RenovationSelections) || {};
  const totalSelectedCost = calculateTotalRenovationCost(renovationSelections);

  const handleRenovationSelectionsChange = async (selections: RenovationSelections) => {
    console.log('Saving renovation selections:', selections);
    
    try {
      await updateDeal({
        id: deal.id,
        renovation_selections: selections
      });
      
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
      <div className="bg-gray-50 p-4 md:p-6 rounded-xl"> {/* Adjusted padding */}
        <h4 className="font-medium text-navy-dark mb-4 text-base md:text-lg">Cost Summary</h4> {/* Adjusted text size */}
        <div className="space-y-4">
          <div>
            <Label htmlFor="selected-reno-cost" className="text-sm md:text-base">Selected Renovations Total</Label>
            <Input 
              id="selected-reno-cost"
              type="text" // Changed to text to allow formatted currency if needed, or keep number and format display elsewhere
              value={formatCurrency(totalSelectedCost)} // Format currency here
              readOnly
              className="mt-1 font-medium bg-gray-100 text-sm md:text-base" // Added bg-gray-100 for readonly
            />
          </div>
          <div>
            <Label htmlFor="contingency" className="text-sm md:text-base">Contingency Buffer (15%)</Label>
            <Input 
              id="contingency"
              type="text" // Changed to text
              value={formatCurrency(Math.round(totalSelectedCost * 0.15))} // Format currency here
              readOnly
              className="mt-1 bg-gray-100 text-sm md:text-base" // Ensured consistent styling
            />
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-xs md:text-sm text-green-700">Total with Contingency</p>
            <p className="text-base md:text-lg font-bold text-green-900">
              {formatCurrency(totalSelectedCost * 1.15)}
            </p>
          </div>
        </div>
      </div>

      {/* Legacy renovation analysis display if available */}
      {deal.renovation_analysis?.recommendations && (
        <div className="bg-orange-50 p-3 md:p-4 rounded-xl"> {/* Adjusted padding */}
          <h4 className="font-semibold text-orange-900 mb-3 text-base md:text-lg">AI Renovation Recommendations</h4> {/* Adjusted text size */}
          <div className="space-y-2">
            {deal.renovation_analysis.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-2">
                <Wrench className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs md:text-sm text-orange-800">{rec}</p> {/* Adjusted text size */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RenovationTab;
