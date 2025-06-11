
import React from 'react';
import { UnifiedProperty } from '@/hooks/useUnifiedProperties';
import { useToast } from '@/hooks/use-toast';

interface PropertyFeedActionsProps {
  addTag: (params: { propertyId: string; tag: string }) => void;
  onSwitchToSavedTab?: () => void;
}

export const usePropertyFeedActions = ({ addTag, onSwitchToSavedTab }: PropertyFeedActionsProps) => {
  const { toast } = useToast();

  const handleImportAsDeal = (property: UnifiedProperty) => {
    // Add 'deal' and 'analysis' tags to convert to a deal
    addTag({ propertyId: property.id, tag: 'deal' });
    addTag({ propertyId: property.id, tag: 'analysis' });
    
    toast({
      title: "Property Imported",
      description: "Property has been added to your pipeline as a new deal.",
    });
  };

  const handleSaveForLater = (property: UnifiedProperty) => {
    addTag({ propertyId: property.id, tag: 'saved' });
  };

  const handleDismiss = (property: UnifiedProperty) => {
    addTag({ propertyId: property.id, tag: 'dismissed' });
  };

  const handleAnalyse = (property: UnifiedProperty) => {
    handleImportAsDeal(property);
    if (onSwitchToSavedTab) {
      setTimeout(() => {
        onSwitchToSavedTab();
      }, 1000);
    }
  };

  return {
    handleImportAsDeal,
    handleSaveForLater,
    handleDismiss,
    handleAnalyse,
  };
};
