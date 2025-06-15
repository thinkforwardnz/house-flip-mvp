
import React, { useState, useEffect } from 'react';
import type { RenovationOption } from '@/types/renovation';
import { DEFAULT_RENOVATION_OPTIONS } from '@/types/renovation';
import RenovationCard from './RenovationCard';

interface RenovationItemProps {
  type: string;
  title: string;
  icon: React.ReactNode;
  isHighValue?: boolean;
  selection: RenovationOption | undefined;
  baseMarketValue: number;
  isUpdating: boolean;
  formatCurrency: (amount: number) => string;
  onItemChange: (type: string, updates: Partial<RenovationOption>) => void;
  onItemToggle: (type: string, enabled: boolean) => void;
}

const RenovationItem = ({
  type,
  title,
  icon,
  isHighValue,
  selection,
  baseMarketValue,
  isUpdating,
  formatCurrency,
  onItemChange,
  onItemToggle,
}: RenovationItemProps) => {
  const defaultOption = DEFAULT_RENOVATION_OPTIONS[type];
  const [rawCostInput, setRawCostInput] = useState<string>('');
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    // Don't update from props if the user is actively editing the input.
    if (isFocused) {
      return;
    }
    const cost = selection?.cost ?? defaultOption.cost;
    setRawCostInput(cost.toString());
  }, [selection?.cost, defaultOption.cost, isFocused]);

  const handleToggle = (enabled: boolean) => {
    onItemToggle(type, enabled);
  };

  const handleCostChange = (value: string) => {
    setRawCostInput(value.replace(/[^0-9]/g, ''));
  };

  const handleCostFocus = () => {
    setIsFocused(true);
  };

  const handleCostBlur = () => {
    setIsFocused(false);
    const numericValue = parseInt(rawCostInput, 10) || 0;
    // Check if value has actually changed to avoid unnecessary saves.
    if (selection?.cost !== numericValue) {
      onItemChange(type, { cost: numericValue });
    }
  };
  
  const handleSliderCommit = (valueAddPercent: number) => {
    if (selection?.value_add_percent !== valueAddPercent) {
      onItemChange(type, { value_add_percent: valueAddPercent });
    }
  };

  return (
    <RenovationCard
      type={type}
      title={title}
      icon={icon}
      isHighValue={isHighValue}
      selection={selection}
      rawCostInput={rawCostInput}
      isUpdating={isUpdating}
      baseMarketValue={baseMarketValue}
      formatCurrency={formatCurrency}
      onToggle={handleToggle}
      onCostChange={handleCostChange}
      onCostBlur={handleCostBlur}
      onCostFocus={handleCostFocus}
      onSliderCommit={handleSliderCommit}
    />
  );
};

export default RenovationItem;
