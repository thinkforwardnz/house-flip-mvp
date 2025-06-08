
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Wrench } from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface RenovationTabProps {
  deal: Deal;
  formatCurrency: (amount: number) => string;
  renovationEstimate: number;
}

const RenovationTab = ({ deal, formatCurrency, renovationEstimate }: RenovationTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-navy-dark">Renovation Cost Estimation</h3>
      
      {deal.renovation_analysis ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-navy-dark mb-3">Room-by-Room Analysis</h4>
            <div className="space-y-3">
              {deal.renovation_analysis.kitchen && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Kitchen Renovation</span>
                    <p className="text-xs text-gray-600">{deal.renovation_analysis.kitchen.description}</p>
                  </div>
                  <span className="font-medium">{formatCurrency(deal.renovation_analysis.kitchen.cost)}</span>
                </div>
              )}
              {deal.renovation_analysis.bathrooms && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Bathroom Renovation</span>
                    <p className="text-xs text-gray-600">{deal.renovation_analysis.bathrooms.description}</p>
                  </div>
                  <span className="font-medium">{formatCurrency(deal.renovation_analysis.bathrooms.cost)}</span>
                </div>
              )}
              {deal.renovation_analysis.flooring && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Flooring</span>
                    <p className="text-xs text-gray-600">{deal.renovation_analysis.flooring.description}</p>
                  </div>
                  <span className="font-medium">{formatCurrency(deal.renovation_analysis.flooring.cost)}</span>
                </div>
              )}
              {deal.renovation_analysis.painting && (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">Painting</span>
                    <p className="text-xs text-gray-600">{deal.renovation_analysis.painting.description}</p>
                  </div>
                  <span className="font-medium">{formatCurrency(deal.renovation_analysis.painting.cost)}</span>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-navy-dark mb-3">Cost Summary</h4>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reno-estimate">Total Renovation Estimate</Label>
                <Input 
                  id="reno-estimate"
                  type="number" 
                  value={renovationEstimate}
                  readOnly
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="contingency">Contingency Buffer (15%)</Label>
                <Input 
                  id="contingency"
                  type="number" 
                  value={Math.round(renovationEstimate * 0.15)}
                  readOnly
                  className="mt-1 bg-gray-50"
                />
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-700">Total with Contingency</p>
                <p className="text-lg font-bold text-green-900">
                  {formatCurrency(renovationEstimate * 1.15)}
                </p>
              </div>
              {deal.renovation_analysis.timeline_weeks && (
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Estimated Timeline</p>
                  <p className="text-lg font-bold text-blue-900">
                    {deal.renovation_analysis.timeline_weeks} weeks
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
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
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="contingency">Contingency Buffer (15%)</Label>
                <Input 
                  id="contingency"
                  type="number" 
                  value={Math.round(renovationEstimate * 0.15)}
                  readOnly
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
      )}

      {deal.renovation_analysis?.recommendations && (
        <div className="bg-orange-50 p-4 rounded-xl">
          <h4 className="font-semibold text-orange-900 mb-3">Renovation Recommendations</h4>
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
