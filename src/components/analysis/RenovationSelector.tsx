import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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

  // This effect syncs incoming prop changes to the local state.
  // It's designed to NOT run when a user is actively editing a field,
  // preventing their input from being overwritten by data from the parent.
  useEffect(() => {
    if (activelyEditing) {
      return; // The user is typing, so we don't want to overwrite their changes.
    }

    // If not editing, we update the local state to match the props.
    setLocalSelections(renovationSelections);
    
    const newRawCosts: Record<string, string> = {};
    Object.keys(DEFAULT_RENOVATION_OPTIONS).forEach(key => {
      const selection = renovationSelections[key];
      const cost = selection?.cost;
      newRawCosts[key] = cost !== undefined 
        ? cost.toString() 
        : (DEFAULT_RENOVATION_OPTIONS[key]?.cost.toString() ?? '');
    });
    setRawCostInputs(newRawCosts);
    
  }, [renovationSelections, activelyEditing]); // This effect now ONLY depends on props and the editing status.

  const saveImmediately = useCallback((selections: RenovationSelections) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsUpdating(true);
    onRenovationChange(selections);
    setTimeout(() => setIsUpdating(false), 400); // Give a bit of time for UI to feel responsive
  }, [onRenovationChange, timeoutRef]);

  // Debounced save function for cost and slider inputs
  const debouncedSave = useMemo(() => {
    return (selections: RenovationSelections) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        saveImmediately(selections);
      }, 700); // Increased debounce time
    };
  }, [saveImmediately]);

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
    saveImmediately(newSelections);
  };

  const handleCostChange = (renovationType: string, value: string) => {
    setActivelyEditing(renovationType);
    
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setRawCostInputs(prev => ({ ...prev, [renovationType]: numericValue }));

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
    setActivelyEditing(null); // Editing is finished on blur

    const rawValue = rawCostInputs[renovationType] ?? '';
    const numericValue = rawValue === '' ? 0 : parseInt(rawValue, 10);
    
    // Format the input to a clean number
    setRawCostInputs(prev => ({
        ...prev,
        [renovationType]: numericValue.toString()
    }));

    // Check if the value has changed and save
    if (localSelections[renovationType]?.cost !== numericValue) {
       const newSelections = {
        ...localSelections,
        [renovationType]: {
          ...localSelections[renovationType]!,
          cost: numericValue
        }
      };
      setLocalSelections(newSelections);
      saveImmediately(newSelections);
    }
  };

  const handleSliderChange = (renovationType: string, valueAddPercent: number) => {
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
    setActivelyEditing(null); // Editing is finished on commit
    
    const newSelections = {
      ...localSelections,
      [renovationType]: {
        ...localSelections[renovationType]!,
        value_add_percent: valueAddPercent
      }
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
