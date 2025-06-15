import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Wrench, Plus } from 'lucide-react';
import type { RenovationSelections, RenovationOption } from '@/types/renovation';
import { DEFAULT_RENOVATION_OPTIONS } from '@/types/renovation';
import RenovationCard from './RenovationCard';

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
  
  // Local state to track user input
  const [localSelections, setLocalSelections] = useState<RenovationSelections>(renovationSelections);
  const [rawCostInputs, setRawCostInputs] = useState<Record<string, string>>(() => {
    const initialRaws: Record<string, string> = {};
    Object.keys(DEFAULT_RENOVATION_OPTIONS).forEach(key => {
      const selection = renovationSelections[key];
      initialRaws[key] = selection?.cost?.toString() ?? DEFAULT_RENOVATION_OPTIONS[key].cost.toString();
    });
    return initialRaws;
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [activelyEditing, setActivelyEditing] = useState<string | null>(null);
  
  // Refs for proper cleanup
  const timeoutRef = useRef<NodeJS.Timeout>();

  // Sync local state with props only when not actively editing
  useEffect(() => {
    if (!activelyEditing) {
      // Only sync if there's a meaningful difference
      const hasChanges = Object.keys(renovationSelections).some(key => {
        const current = localSelections[key];
        const incoming = renovationSelections[key];
        return JSON.stringify(current) !== JSON.stringify(incoming);
      });
      
      if (hasChanges) {
        setLocalSelections(renovationSelections);
      }
    }
  }, [renovationSelections, activelyEditing, localSelections]);

  // Debounced save function with proper cleanup
  const debouncedSave = useMemo(() => {
    return (selections: RenovationSelections) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        setIsUpdating(true);
        onRenovationChange(selections);
        setTimeout(() => {
          setIsUpdating(false);
          setActivelyEditing(null);
        }, 300);
      }, 500);
    };
  }, [onRenovationChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
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

  const handleCostChange = (renovationType: string, value: string) => {
    setActivelyEditing(renovationType);
    
    // Allow only numeric characters for cost
    const numericValue = value.replace(/[^0-9]/g, '');
    
    // Update raw string state for immediate input feedback
    setRawCostInputs(prev => ({ ...prev, [renovationType]: numericValue }));

    // Parse to number for calculations and saving
    const cost = numericValue === '' ? 0 : parseInt(numericValue, 10);
    
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

  const handleCostBlur = (renovationType: string) => {
    const rawValue = rawCostInputs[renovationType] ?? '0';
    const numericValue = parseInt(rawValue, 10) || 0;
    
    // Clean up the input field to show the formatted number
    setRawCostInputs(prev => ({
        ...prev,
        [renovationType]: numericValue.toString()
    }));
  };

  const handleSliderChange = (renovationType: string, valueAddPercent: number) => {
    // Set actively editing to prevent prop sync from overwriting slider value during drag
    setActivelyEditing(renovationType);
    const newSelections = {
      ...localSelections,
      [renovationType]: {
        ...localSelections[renovationType]!,
        value_add_percent: valueAddPercent
      }
    };
    
    setLocalSelections(newSelections);
  };

  const handleSliderCommit = (renovationType: string, valueAddPercent: number) => {
    // Only trigger save when user releases the slider
    const newSelections = {
      ...localSelections,
      [renovationType]: {
        ...localSelections[renovationType]!,
        value_add_percent: valueAddPercent
      }
    };
    
    setLocalSelections(newSelections); // Ensure final value is set
    debouncedSave(newSelections);
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
        {renovationItems.map(({ type, title, icon, isHighValue }) => (
          <RenovationCard
            key={type}
            type={type}
            title={title}
            icon={icon}
            isHighValue={isHighValue}
            selection={localSelections[type]}
            rawCostInput={rawCostInputs[type] ?? ''}
            isUpdating={isUpdating}
            baseMarketValue={baseMarketValue}
            formatCurrency={formatCurrency}
            onToggle={(enabled) => handleRenovationToggle(type, enabled)}
            onCostChange={(value) => handleCostChange(type, value)}
            onCostBlur={() => handleCostBlur(type)}
            onCostFocus={() => setActivelyEditing(type)}
            onSliderChange={(value) => handleSliderChange(type, value)}
            onSliderCommit={(value) => handleSliderCommit(type, value)}
          />
        ))}
      </div>
    </div>
  );
};

export default RenovationSelector;
