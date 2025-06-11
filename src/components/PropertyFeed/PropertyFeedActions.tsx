import React from 'react';
import { UnifiedProperty } from '@/hooks/useUnifiedProperties';
import { useToast } from '@/hooks/use-toast';

interface PropertyFeedActionsProps {
  addTag: (params: { propertyId: string; tag: string }) => void;
  removeTag: (params: { propertyId: string; tag: string }) => void;
  onSwitchToSavedTab?: () => void;
}

export const usePropertyFeedActions = ({ addTag, removeTag, onSwitchToSavedTab }: PropertyFeedActionsProps) => {
  const { toast } = useToast();

  const handleImportAsDeal = (property: UnifiedProperty) => {
    // Remove prospecting tag and add deal and analysis tags
    removeTag({ propertyId: property.id, tag: 'prospecting' });
    addTag({ propertyId: property.id, tag: 'deal' });
    addTag({ propertyId: property.id, tag: 'analysis' });
    
    toast({
      title: "Property Imported",
      description: "Property has been added to your pipeline as a new deal.",
    });
  };

  const handleSaveForLater = (property: UnifiedProperty) => {
    // Add saved tag (keep prospecting tag)
    addTag({ propertyId: property.id, tag: 'saved' });
    
    toast({
      title: "Property Saved",
      description: "Property has been saved to your watchlist.",
    });
  };

  const handleDismiss = (property: UnifiedProperty) => {
    // Add dismissed tag and remove from active prospecting
    addTag({ propertyId: property.id, tag: 'dismissed' });
    removeTag({ propertyId: property.id, tag: 'prospecting' });
    
    toast({
      title: "Property Dismissed",
      description: "Property will no longer appear in your feed.",
    });
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
