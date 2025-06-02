
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

interface AnalysisData {
  offerPrice: number;
  renoEstimate: number;
  timeline: number;
  holdingCosts: number;
  sellingCosts: number;
  addBedroom: boolean;
  bedroomCost: number;
  notes: string;
}

interface AnalysisFormProps {
  data: AnalysisData;
  onChange: (data: AnalysisData) => void;
}

const AnalysisForm = ({ data, onChange }: AnalysisFormProps) => {
  const handleChange = (field: keyof AnalysisData, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-4">
      {/* Offer & Purchase */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Offer & Purchase</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="offerPrice">Offer Price</Label>
            <Input
              id="offerPrice"
              type="number"
              value={data.offerPrice}
              onChange={(e) => handleChange('offerPrice', Number(e.target.value))}
              placeholder="Enter offer amount"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Recommended range: 70-80% of ARV minus reno costs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Renovation */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Renovation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="renoEstimate">Renovation Estimate</Label>
            <Input
              id="renoEstimate"
              type="number"
              value={data.renoEstimate}
              onChange={(e) => handleChange('renoEstimate', Number(e.target.value))}
              placeholder="Total renovation cost"
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="timeline">Timeline (weeks)</Label>
            <Input
              id="timeline"
              type="number"
              value={data.timeline}
              onChange={(e) => handleChange('timeline', Number(e.target.value))}
              placeholder="Estimated weeks"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Most flips take 4–8 weeks
            </p>
          </div>

          {/* Add Bedroom Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <Label htmlFor="addBedroom" className="font-medium">
                Add Bedroom Scenario
              </Label>
              <p className="text-sm text-gray-500">
                Include cost and value of adding a bedroom
              </p>
            </div>
            <Switch
              id="addBedroom"
              checked={data.addBedroom}
              onCheckedChange={(checked) => handleChange('addBedroom', checked)}
            />
          </div>

          {data.addBedroom && (
            <div>
              <Label htmlFor="bedroomCost">Additional Bedroom Cost</Label>
              <Input
                id="bedroomCost"
                type="number"
                value={data.bedroomCost}
                onChange={(e) => handleChange('bedroomCost', Number(e.target.value))}
                placeholder="Cost to add bedroom"
                className="mt-1"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Holding & Selling */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Holding & Selling</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="holdingCosts">Holding Costs</Label>
            <Input
              id="holdingCosts"
              type="number"
              value={data.holdingCosts}
              onChange={(e) => handleChange('holdingCosts', Number(e.target.value))}
              placeholder="Monthly carrying costs"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Insurance, taxes, utilities, financing
            </p>
          </div>

          <div>
            <Label htmlFor="sellingCosts">Selling Costs</Label>
            <Input
              id="sellingCosts"
              type="number"
              value={data.sellingCosts}
              onChange={(e) => handleChange('sellingCosts', Number(e.target.value))}
              placeholder="Agent fees, closing costs"
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Typically 6-8% of sale price
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={data.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add your analysis notes, observations, or concerns..."
            className="min-h-24"
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisForm;
