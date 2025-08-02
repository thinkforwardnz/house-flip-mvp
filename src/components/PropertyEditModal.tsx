import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface PropertyEditModalProps {
  deal: Deal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dealId: string, updates: Partial<Deal>) => void;
  isUpdating: boolean;
}

const PropertyEditModal: React.FC<PropertyEditModalProps> = ({
  deal,
  isOpen,
  onClose,
  onSave,
  isUpdating
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    pipeline_stage: deal?.pipeline_stage || 'Analysis',
    notes: deal?.notes || '',
    purchase_price: deal?.purchase_price || 0,
    current_risk: deal?.current_risk || 'low',
    target_sale_price: deal?.target_sale_price || 0,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getStageRoute = (stage: string) => {
    switch (stage) {
      case 'Sold':
        return '/sold';
      case 'Listed':
        return '/listed';
      case 'Reno':
        return '/renovation';
      case 'Under Contract':
        return '/under-contract';
      case 'Offer':
        return '/offer';
      case 'Analysis':
        return '/analysis';
      default:
        return '/analysis';
    }
  };

  const handleSave = () => {
    if (!deal) return;
    
    const updates = {
      pipeline_stage: formData.pipeline_stage as Deal['pipeline_stage'],
      notes: formData.notes,
      purchase_price: Number(formData.purchase_price),
      current_risk: formData.current_risk as Deal['current_risk'],
      target_sale_price: Number(formData.target_sale_price),
    };
    
    onSave(deal.id, updates);
  };

  const handleGoToPipeline = () => {
    if (!deal) return;
    handleSave();
    const route = getStageRoute(formData.pipeline_stage);
    navigate(`${route}?dealId=${deal.id}`);
    onClose();
  };

  const handleFieldChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (!deal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-navy-dark">Edit Property Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Property Info */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="font-medium text-navy-dark mb-1">{deal.address}</h3>
            <p className="text-sm text-navy">{deal.suburb}, {deal.city}</p>
            {deal.current_profit > 0 && (
              <p className="text-sm text-green-600 font-medium mt-1">
                Current Profit: {formatCurrency(deal.current_profit)}
              </p>
            )}
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="pipeline_stage">Pipeline Stage</Label>
              <Select 
                value={formData.pipeline_stage} 
                onValueChange={(value) => handleFieldChange('pipeline_stage', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select stage" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Analysis">Analysis</SelectItem>
                  <SelectItem value="Offer">Offer</SelectItem>
                  <SelectItem value="Under Contract">Under Contract</SelectItem>
                  <SelectItem value="Reno">Renovation</SelectItem>
                  <SelectItem value="Listed">Listed</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="purchase_price">Purchase Price (NZD)</Label>
              <Input
                id="purchase_price"
                type="number"
                value={formData.purchase_price}
                onChange={(e) => handleFieldChange('purchase_price', Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="target_sale_price">Target Sale Price (NZD)</Label>
              <Input
                id="target_sale_price"
                type="number"
                value={formData.target_sale_price}
                onChange={(e) => handleFieldChange('target_sale_price', Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="current_risk">Risk Level</Label>
              <Select 
                value={formData.current_risk} 
                onValueChange={(value) => handleFieldChange('current_risk', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select risk level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Add notes about this property..."
                rows={3}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? 'Saving...' : 'Done'}
            </Button>
            <Button 
              onClick={handleGoToPipeline}
              disabled={isUpdating}
              className="flex-1"
            >
              Go to Pipeline
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PropertyEditModal;