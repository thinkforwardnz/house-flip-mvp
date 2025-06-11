
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';
import { useUnifiedProperties } from '@/hooks/useUnifiedProperties';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const CreateDealDialog = () => {
  const { createDeal, isCreating } = useDeals();
  const { properties } = useUnifiedProperties();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [searchAddress, setSearchAddress] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [isCreatingProperty, setIsCreatingProperty] = useState(false);
  const [formData, setFormData] = useState({
    pipeline_stage: 'Analysis' as const,
    purchase_price: 0,
    target_sale_price: 0,
    current_profit: 0,
    current_risk: 'medium' as const,
    notes: '',
  });

  // Filter properties based on search
  const filteredProperties = properties.filter(property =>
    property.address.toLowerCase().includes(searchAddress.toLowerCase()) ||
    property.suburb?.toLowerCase().includes(searchAddress.toLowerCase()) ||
    property.city?.toLowerCase().includes(searchAddress.toLowerCase())
  );

  const handleCreateNewProperty = async () => {
    if (!searchAddress.trim()) {
      toast({
        title: "Address Required",
        description: "Please enter an address to create a new property",
        variant: "destructive",
      });
      return;
    }

    setIsCreatingProperty(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('unified_properties')
        .insert({
          address: searchAddress.trim(),
          city: 'Auckland',
          user_id: user?.id,
          tags: ['deal']
        })
        .select()
        .single();

      if (error) throw error;

      setSelectedPropertyId(data.id);
      toast({
        title: "Property Created",
        description: "New property has been created and selected",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create property",
        variant: "destructive",
      });
    } finally {
      setIsCreatingProperty(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPropertyId) {
      toast({
        title: "Property Required",
        description: "Please select or create a property for this deal",
        variant: "destructive",
      });
      return;
    }
    
    createDeal({
      propertyId: selectedPropertyId,
      ...formData
    });
    
    setOpen(false);
    setFormData({
      pipeline_stage: 'Analysis',
      purchase_price: 0,
      target_sale_price: 0,
      current_profit: 0,
      current_risk: 'medium',
      notes: '',
    });
    setSearchAddress('');
    setSelectedPropertyId('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
          <Plus className="h-4 w-4 mr-2" />
          Add New Deal
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Property Deal</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Property Selection */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <Label htmlFor="property-search">Property Address</Label>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="property-search"
                  placeholder="Search existing properties or enter new address..."
                  value={searchAddress}
                  onChange={(e) => setSearchAddress(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                type="button"
                onClick={handleCreateNewProperty}
                disabled={!searchAddress.trim() || isCreatingProperty}
                variant="outline"
              >
                {isCreatingProperty ? "Creating..." : "Create New"}
              </Button>
            </div>
            
            {/* Property Selection */}
            {filteredProperties.length > 0 && (
              <div className="space-y-2">
                <Label>Select Property:</Label>
                <div className="max-h-40 overflow-y-auto space-y-2">
                  {filteredProperties.map((property) => (
                    <div
                      key={property.id}
                      className={`p-3 border rounded cursor-pointer transition-colors ${
                        selectedPropertyId === property.id
                          ? 'bg-blue-50 border-blue-200'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedPropertyId(property.id)}
                    >
                      <div className="font-medium">{property.address}</div>
                      <div className="text-sm text-gray-600">
                        {property.suburb && `${property.suburb}, `}{property.city}
                      </div>
                      {property.bedrooms && property.bathrooms && (
                        <div className="text-sm text-gray-500">
                          {property.bedrooms} bed, {property.bathrooms} bath
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPropertyId && (
              <div className="p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
                ✓ Property selected for this deal
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pipeline_stage">Pipeline Stage</Label>
              <Select value={formData.pipeline_stage} onValueChange={(value: any) => setFormData({ ...formData, pipeline_stage: value })}>
                <SelectTrigger>
                  <SelectValue />
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
              <Label htmlFor="current_risk">Risk Level</Label>
              <Select value={formData.current_risk} onValueChange={(value: any) => setFormData({ ...formData, current_risk: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Risk</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="high">High Risk</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase_price">Purchase Price (NZD)</Label>
              <Input
                id="purchase_price"
                type="number"
                placeholder="850000"
                value={formData.purchase_price || ''}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <Label htmlFor="target_sale_price">Target Sale Price (NZD)</Label>
              <Input
                id="target_sale_price"
                type="number"
                placeholder="1200000"
                value={formData.target_sale_price || ''}
                onChange={(e) => setFormData({ ...formData, target_sale_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this deal..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating || !selectedPropertyId} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
              {isCreating ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDealDialog;
