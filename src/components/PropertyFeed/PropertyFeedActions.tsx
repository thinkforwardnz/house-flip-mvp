
import React from 'react';
import { UnifiedProperty } from '@/hooks/useUnifiedProperties';
import { useToast } from '@/hooks/use-toast';
import { usePropertyEnrichment } from '@/hooks/usePropertyEnrichment';

interface PropertyFeedActionsProps {
  addTag: (params: { propertyId: string; tag: string }) => void;
  removeTag: (params: { propertyId: string; tag: string }) => void;
  onSwitchToSavedTab?: () => void;
}

export const usePropertyFeedActions = ({ addTag, removeTag, onSwitchToSavedTab }: PropertyFeedActionsProps) => {
  const { toast } = useToast();
  const { enrichProperty } = usePropertyEnrichment();

  const handleImportAsDeal = async (property: UnifiedProperty) => {
    try {
      // First enrich the property with detailed data
      console.log('Starting property enrichment for analysis...');
      const enrichmentResult = await enrichProperty(property.id);
      
      if (enrichmentResult.success) {
        // Remove prospecting tag and add deal and analysis tags
        removeTag({ propertyId: property.id, tag: 'prospecting' });
        addTag({ propertyId: property.id, tag: 'deal' });
        addTag({ propertyId: property.id, tag: 'analysis' });
        
        toast({
          title: "Property Imported",
          description: "Property has been enriched and added to your pipeline as a new deal.",
        });
      } else {
        // Still import but note enrichment failed
        removeTag({ propertyId: property.id, tag: 'prospecting' });
        addTag({ propertyId: property.id, tag: 'deal' });
        addTag({ propertyId: property.id, tag: 'analysis' });
        
        toast({
          title: "Property Imported",
          description: "Property added to pipeline, but enrichment failed. You may need to add details manually.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error during property import:', error);
      toast({
        title: "Import Error",
        description: "Failed to import property. Please try again.",
        variant: "destructive",
      });
    }
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

  const handleAnalyse = async (property: UnifiedProperty) => {
    await handleImportAsDeal(property);
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
