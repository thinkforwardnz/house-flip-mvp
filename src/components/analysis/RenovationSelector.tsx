
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Wrench, Plus } from 'lucide-react';
import type { RenovationSelections, RenovationOption } from '@/types/renovation';
import { DEFAULT_RENOVATION_OPTIONS } from '@/types/renovation';

interface RenovationSelectorProps {
  renovationSelections: RenovationSelections;
  onRenovationChange: (selections: RenovationSelections) => void;
  formatCurrency: (amount: number) => string;
  baseMarketValue: number;
}

const RenovationSelector = ({ 
  renovationSelections, 
  onRenovationChange, 
  formatCurrency,
  baseMarketValue 
}: RenovationSelectorProps) => {
  
  // Local state to track user input
  const [localSelections, setLocalSelections] = useState<RenovationSelections>(renovationSelections);
  const [isUpdating, setIsUpdating] = useState(false);

  // Sync local state with props when they change externally
  useEffect(() => {
    setLocalSelections(renovationSelections);
  }, [renovationSelections]);

  // Debounced save function
  const debouncedSave = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    
    return (selections: RenovationSelections) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsUpdating(true);
        onRenovationChange(selections);
        // Add a small delay to show feedback
        setTimeout(() => setIsUpdating(false), 300);
      }, 500);
    };
  }, [onRenovationChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      // Clear any pending timeouts when component unmounts
    };
  }, []);

  const handleRenovationToggle = (renovationType: string, enabled: boolean) => {
    const defaultOption = DEFAULT_RENOVATION_OPTIONS[renovationType];
    const newSelections = {
      ...localSelections,
      [renovationType]: enabled 
        ? { 
            selected: true, 
            cost: localSelections[renovationType]?.cost ?? defaultOption.cost,
            value_add_percent: localSelections[renovationType]?.value_add_percent ?? defaultOption.value_add_percent,
            description: defaultOption.description
          }
        : { ...localSelections[renovationType], selected: false }
    };
    
    setLocalSelections(newSelections);
    // Immediate save for toggle changes
    setIsUpdating(true);
    onRenovationChange(newSelections);
    setTimeout(() => setIsUpdating(false), 300);
  };

  const handleCostChange = (renovationType: string, cost: number) => {
    const newSelections = {
      ...localSelections,
      [renovationType]: {
        ...localSelections[renovationType]!,
        cost
      }
    };
    
    setLocalSelections(newSelections);
    debouncedSave(newSelections);
  };

  const handleValueAddChange = (renovationType: string, valueAddPercent: number) => {
    const newSelections = {
      ...localSelections,
      [renovationType]: {
        ...localSelections[renovationType]!,
        value_add_percent: valueAddPercent
      }
    };
    
    setLocalSelections(newSelections);
    debouncedSave(newSelections);
  };

  const getRenovationCard = (
    type: string, 
    title: string, 
    icon: React.ReactNode,
    isHighValue = false
  ) => {
    const option = localSelections[type];
    const defaultOption = DEFAULT_RENOVATION_OPTIONS[type];
    const isSelected = option?.selected || false;
    const cost = option?.cost ?? defaultOption.cost;
    const valueAddPercent = option?.value_add_percent ?? defaultOption.value_add_percent;
    const valueAdd = baseMarketValue * (valueAddPercent / 100);

    return (
      <Card key={type} className={`${isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-200'} ${isHighValue ? 'border-green-200 bg-green-50' : ''} ${isUpdating ? 'opacity-75' : ''}`}>
        <CardHeader className="pb-2 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon}
              <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
              {isHighValue && <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />}
            </div>
            <Switch
              checked={isSelected}
              onCheckedChange={(enabled) => handleRenovationToggle(type, enabled)}
              disabled={isUpdating}
            />
          </div>
        </CardHeader>
        
        {isSelected && (
          <CardContent className="pt-0 p-3 space-y-3">
            <p className="text-xs text-gray-600">{defaultOption.description}</p>
            
            <div>
              <Label htmlFor={`${type}-cost`} className="text-xs">Cost</Label>
              <Input
                id={`${type}-cost`}
                type="number"
                value={cost}
                onChange={(e) => handleCostChange(type, Number(e.target.value))}
                className="mt-1 h-8 text-xs sm:text-sm"
                disabled={isUpdating}
              />
            </div>

            <div>
              <Label htmlFor={`${type}-value`} className="text-xs">Value add %</Label>
              <div className="mt-2 px-2">
                <Slider
                  value={[valueAddPercent]}
                  onValueChange={([value]) => handleValueAddChange(type, value)}
                  max={type === 'add_bedroom' ? 30 : 10}
                  min={0}
                  step={0.5}
                  className="w-full"
                  disabled={isUpdating}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>{valueAddPercent}%</span>
                <span>+{formatCurrency(valueAdd)}</span>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-navy-dark mb-1">Renovation Selection</h3>
        <p className="text-xs text-gray-600 mb-2">
          Select the renovations you plan to complete and adjust costs and value-add estimates.
        </p>
        {isUpdating && (
          <p className="text-xs text-blue-600 mb-2">Saving changes...</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {getRenovationCard('add_bedroom', 'Add Bedroom', <Plus className="h-4 w-4 text-green-600" />, true)}
        {getRenovationCard('kitchen', 'Kitchen Renovation', <Wrench className="h-4 w-4 text-blue-600" />)}
        {getRenovationCard('bathroom', 'Bathroom Renovation', <Wrench className="h-4 w-4 text-purple-600" />)}
        {getRenovationCard('flooring', 'Flooring Replacement', <Wrench className="h-4 w-4 text-orange-600" />)}
        {getRenovationCard('painting', 'Interior/Exterior Painting', <Wrench className="h-4 w-4 text-pink-600" />)}
      </div>
    </div>
  );
};

export default RenovationSelector;
