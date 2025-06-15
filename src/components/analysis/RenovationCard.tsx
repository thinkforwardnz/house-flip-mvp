
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Plus } from 'lucide-react';
import type { RenovationOption } from '@/types/renovation';
import { DEFAULT_RENOVATION_OPTIONS } from '@/types/renovation';

interface RenovationCardProps {
  type: string;
  title: string;
  icon: React.ReactNode;
  isHighValue?: boolean;
  selection: RenovationOption | undefined;
  rawCostInput: string;
  isUpdating: boolean;
  baseMarketValue: number;
  formatCurrency: (amount: number) => string;
  onToggle: (enabled: boolean) => void;
  onCostChange: (value: string) => void;
  onCostBlur: () => void;
  onSliderChange: (value: number) => void;
  onSliderCommit: (value: number) => void;
  onCostFocus: () => void;
}

const RenovationCard = ({
  type,
  title,
  icon,
  isHighValue = false,
  selection,
  rawCostInput,
  isUpdating,
  baseMarketValue,
  formatCurrency,
  onToggle,
  onCostChange,
  onCostBlur,
  onSliderChange,
  onSliderCommit,
  onCostFocus,
}: RenovationCardProps) => {
  const defaultOption = DEFAULT_RENOVATION_OPTIONS[type];
  const isSelected = selection?.selected || false;
  const valueAddPercent = selection?.value_add_percent ?? defaultOption.value_add_percent;
  const valueAdd = baseMarketValue * (valueAddPercent / 100);

  return (
    <Card className={`${isSelected ? 'border-blue-200 bg-blue-50' : 'border-gray-200'} ${isHighValue ? 'border-green-200 bg-green-50' : ''} ${isUpdating ? 'opacity-75' : ''}`}>
      <CardHeader className="pb-2 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <CardTitle className="text-xs sm:text-sm font-medium">{title}</CardTitle>
            {isHighValue && <Plus className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />}
          </div>
          <Switch
            checked={isSelected}
            onCheckedChange={onToggle}
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
              type="text"
              value={rawCostInput}
              onChange={(e) => onCostChange(e.target.value)}
              onFocus={onCostFocus}
              onBlur={onCostBlur}
              placeholder="Enter cost"
              className="mt-1 h-8 text-xs sm:text-sm"
              disabled={isUpdating}
            />
          </div>

          <div>
            <Label htmlFor={`${type}-value`} className="text-xs">Value add %</Label>
            <div className="mt-2 px-2">
              <Slider
                value={[valueAddPercent]}
                onValueChange={([value]) => onSliderChange(value)}
                onValueCommit={([value]) => onSliderCommit(value)}
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

export default RenovationCard;
