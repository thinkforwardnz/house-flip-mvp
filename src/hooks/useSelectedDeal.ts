
import { useState, useEffect } from 'react';
import { useDeals } from '@/hooks/useDeals';
import { useSearchParams } from 'react-router-dom';

export const useSelectedDeal = (requiredStage?: string) => {
  const { deals, isLoading } = useDeals();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);

  // Get dealId from URL params or default to first deal in stage
  useEffect(() => {
    const dealIdFromUrl = searchParams.get('dealId');
    
    if (dealIdFromUrl && deals.find(d => d.id === dealIdFromUrl)) {
      // Only update if different to prevent unnecessary re-renders
      if (selectedDealId !== dealIdFromUrl) {
        setSelectedDealId(dealIdFromUrl);
      }
    } else if (deals.length > 0 && !isLoading) {
      // Find first deal in required stage, or just first deal
      const filteredDeals = requiredStage 
        ? deals.filter(d => d.pipeline_stage === requiredStage)
        : deals;
      
      if (filteredDeals.length > 0) {
        const firstDeal = filteredDeals[0];
        // Only update if different to prevent unnecessary re-renders
        if (selectedDealId !== firstDeal.id) {
          setSelectedDealId(firstDeal.id);
          setSearchParams({ dealId: firstDeal.id });
        }
      }
    }
  }, [deals, isLoading, searchParams, setSearchParams, requiredStage, selectedDealId]);

  const selectedDeal = selectedDealId ? deals.find(d => d.id === selectedDealId) : null;

  const selectDeal = (dealId: string) => {
    setSelectedDealId(dealId);
    setSearchParams({ dealId });
  };

  return {
    selectedDeal,
    selectedDealId,
    selectDeal,
    isLoading
  };
};
