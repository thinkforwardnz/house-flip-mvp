import React from 'react';
import { UnifiedProperty } from '@/hooks/useUnifiedProperties';
import { useToast } from '@/hooks/use-toast';
import { usePropertyEnrichment } from '@/hooks/usePropertyEnrichment';
import { useCreateDeal } from '@/hooks/mutations/useCreateDeal';
import { useNavigate } from 'react-router-dom';

interface PropertyFeedActionsProps {
  addTag: (params: { propertyId: string; tag: string }) => void;
  removeTag: (params: { propertyId: string; tag: string }) => void;
  onSwitchToSavedTab?: () => void;
}

export const usePropertyFeedActions = ({ addTag, removeTag }: PropertyFeedActionsProps) => {
  const { toast } = useToast();
  const { enrichProperty } = usePropertyEnrichment();
  const { createDealAsync } = useCreateDeal();
  const navigate = useNavigate();

  const handleImportAsDeal = async (property: UnifiedProperty) => {
    try {
      // First, attempt to enrich the property with detailed data
      console.log('Starting property enrichment for analysis...');
      const enrichmentResult = await enrichProperty(property.id);
      
      // Regardless of enrichment, create the deal
      console.log(`Creating deal for property ${property.id}...`);
      const newDeal = await createDealAsync({
        propertyId: property.id,
        pipeline_stage: 'Analysis',
        purchase_price: property.current_price || 0,
        target_sale_price: property.ai_arv || 0,
        estimated_renovation_cost: property.ai_reno_cost || 0,
        current_profit: property.ai_est_profit || 0,
        current_risk: 'medium',
        notes: `Deal created from property feed for: ${property.address}.`,
      });

      // Update tags to reflect the new status
      removeTag({ propertyId: property.id, tag: 'prospecting' });
      addTag({ propertyId: property.id, tag: 'deal' });
      addTag({ propertyId: property.id, tag: 'analysis' });
      
      if (enrichmentResult.success) {
        toast({
          title: "Property Imported as Deal",
          description: "Property has been enriched and added to your pipeline for analysis.",
        });
      } else {
        toast({
          title: "Property Imported as Deal",
          description: "Property added to pipeline, but enrichment failed. You may need to add details manually.",
          variant: "default",
        });
      }

      return newDeal;

    } catch (error) {
      console.error('Error during property import as deal:', error);
      toast({
        title: "Import Error",
        description: "Failed to import property as a new deal. Please try again.",
        variant: "destructive",
      });
      return null;
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
    const newDeal = await handleImportAsDeal(property);
    if (newDeal) {
      navigate(`/analysis?dealId=${newDeal.id}`);
    }
  };

  return {
    handleImportAsDeal,
    handleSaveForLater,
    handleDismiss,
    handleAnalyse,
  };
};
