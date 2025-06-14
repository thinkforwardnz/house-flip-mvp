
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wrench } from 'lucide-react';
import type { Deal } from '@/types/analysis';
import type { RenovationSelections } from '@/types/renovation';
import RenovationSelector from './RenovationSelector';
import { calculateTotalRenovationCost } from '@/utils/arvCalculation';
import { useDeals } from '@/hooks/useDeals';
import { useToast } from '@/hooks/use-toast'; // Corrected import path

interface RenovationTabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  renovationEstimate: number; 
  onDealUpdate: (updates: Partial<Deal>) => void;
}

const RenovationTab = ({ deal, formatCurrency, /* renovationEstimate, */ onDealUpdate }: RenovationTabProps) => {
  const { updateDeal } = useDeals();
  const { toast } = useToast(); // Corrected usage
  
  const baseMarketValue = deal.market_analysis?.analysis?.estimated_arv || 
                         deal.target_sale_price || 
                         deal.purchase_price ||
                         0;
                         
  const renovationSelections = (deal.renovation_selections as RenovationSelections) || {};
  const totalSelectedCost = calculateTotalRenovationCost(renovationSelections);

  const handleRenovationSelectionsChange = async (selections: RenovationSelections) => {
    console.log('Saving renovation selections:', selections);
    
    try {
      // The updateDeal mutation now handles the auth check internally
      await updateDeal({ // updateDeal from useDeals is an async function if `mutateAsync` is used, or void if `mutate` is used.
                          // Assuming it's meant to be awaited, it should be `updateDeal.mutateAsync` or handled via callbacks.
                          // For simplicity, if `updateDeal` is `mutate`, we rely on its onError handler.
                          // If `updateDeal` is `mutateAsync`, this try/catch is fine.
                          // The current useDeals hook returns `mutate` not `mutateAsync`.
                          // So, the try/catch here might not catch promise rejections directly from `mutate`.
                          // The onError in `useMutation` will handle it.
        id: deal.id,
        renovation_selections: selections
      }, {
        onSuccess: () => {
          onDealUpdate({
            renovation_selections: selections
          });
          console.log('Renovation selections saved successfully via RenovationTab onSuccess');
          // Toast for success is handled by useDeals hook
        },
        onError: (error: any) => {
          // This onError will be called if the mutation fails.
          console.error('Failed to save renovation selections (RenovationTab onError):', error);
          let description = "Failed to save renovation selections. Please try again.";
          if (error.message && error.message.includes('User not authenticated')) {
            description = "Authentication error. Please log in and try again.";
          } else if (error.message) {
            description = error.message;
          }
          toast({
            title: "Error",
            description: description,
            variant: "destructive",
          });
        }
      });
      
    } catch (error: any) { // This catch block may not be effective if updateDeal is not promise-based.
      console.error('Outer catch: Failed to save renovation selections:', error);
      let description = "An unexpected error occurred. Please try again.";
       if (error.message && error.message.includes('User not authenticated')) {
        description = "Authentication error. Please log in and try again.";
      } else if (error.message) {
        description = error.message;
      }
      toast({
        title: "Error",
        description: description,
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
              type="text" 
              value={formatCurrency(totalSelectedCost)} 
              readOnly
              className="mt-1 font-medium bg-gray-100 text-sm md:text-base" 
            />
          </div>
          <div>
            <Label htmlFor="contingency" className="text-sm md:text-base">Contingency Buffer (15%)</Label>
            <Input 
              id="contingency"
              type="text" 
              value={formatCurrency(Math.round(totalSelectedCost * 0.15))} 
              readOnly
              className="mt-1 bg-gray-100 text-sm md:text-base" 
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

