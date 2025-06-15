
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Wrench, Plus } from 'lucide-react';
import type { RenovationSelections, RenovationOption } from '@/types/renovation';
import { DEFAULT_RENOVATION_OPTIONS } from '@/types/renovation';
import RenovationItem from './RenovationItem';

interface RenovationSelectorProps {
  renovationSelections: RenovationSelections;
  onRenovationChange: (selections: RenovationSelections) => void;
  formatCurrency: (amount: number) => string;
  baseMarketValue: number;
}

const renovationItems = [
  { type: 'add_bedroom', title: 'Add Bedroom', icon: <Plus className="h-4 w-4 text-green-600" />, isHighValue: true },
  { type: 'kitchen', title: 'Kitchen Renovation', icon: <Wrench className="h-4 w-4 text-blue-600" /> },
  { type: 'bathroom', title: 'Bathroom Renovation', icon: <Wrench className="h-4 w-4 text-purple-600" /> },
  { type: 'flooring', title: 'Flooring Replacement', icon: <Wrench className="h-4 w-4 text-orange-600" /> },
  { type: 'painting', title: 'Interior/Exterior Painting', icon: <Wrench className="h-4 w-4 text-pink-600" /> },
];

const RenovationSelector = ({ 
  renovationSelections, 
  onRenovationChange, 
  formatCurrency,
  baseMarketValue 
}: RenovationSelectorProps) => {
  
  const [localSelections, setLocalSelections] = useState<RenovationSelections>(renovationSelections);
  const [isUpdating, setIsUpdating] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalSelections(renovationSelections);
  }, [renovationSelections]);

  const saveImmediately = useCallback((selections: RenovationSelections) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsUpdating(true);
    onRenovationChange(selections);
    setTimeout(() => setIsUpdating(false), 400);
  }, [onRenovationChange]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleItemToggle = (renovationType: string, enabled: boolean) => {
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
    saveImmediately(newSelections);
  };

  const handleItemChange = (renovationType: string, updates: Partial<RenovationOption>) => {
    const currentSelection = localSelections[renovationType];
    const defaultOption = DEFAULT_RENOVATION_OPTIONS[renovationType];

    const newSelections = {
      ...localSelections,
      [renovationType]: {
        selected: true,
        cost: currentSelection?.cost ?? defaultOption.cost,
        value_add_percent: currentSelection?.value_add_percent ?? defaultOption.value_add_percent,
        description: currentSelection?.description ?? defaultOption.description,
        ...updates
      },
    };
    setLocalSelections(newSelections);
    saveImmediately(newSelections);
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-navy-dark mb-1">Renovation Selection</h3>
        <p className="text-xs text-gray-600 mb-2">
          Select the renovations you plan to complete and adjust costs and value-add estimates.
        </p>
        {isUpdating && (
          <p className="text-xs text-blue-600 mb-2 animate-pulse">Saving changes...</p>
        )}
      </div>
      <div className="grid grid-cols-1 gap-2 sm:gap-3">
        {renovationItems.map(({ type, title, icon, isHighValue }) => (
          <RenovationItem
            key={type}
            type={type}
            title={title}
            icon={icon}
            isHighValue={isHighValue}
            selection={localSelections[type]}
            isUpdating={isUpdating}
            baseMarketValue={baseMarketValue}
            formatCurrency={formatCurrency}
            onItemToggle={handleItemToggle}
            onItemChange={handleItemChange}
          />
        ))}
      </div>
    </div>
  );
};

export default RenovationSelector;
