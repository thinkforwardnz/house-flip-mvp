
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { useDeals } from '@/hooks/useDeals';

const CreateDealDialog = () => {
  const { createDeal, isCreating } = useDeals();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    address: '',
    suburb: '',
    city: 'Auckland',
    pipeline_stage: 'Analysis' as const,
    purchase_price: '',
    target_sale_price: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createDeal({
      ...formData,
      purchase_price: formData.purchase_price ? parseFloat(formData.purchase_price) : 0,
      target_sale_price: formData.target_sale_price ? parseFloat(formData.target_sale_price) : 0,
    });
    
    setOpen(false);
    setFormData({
      address: '',
      suburb: '',
      city: 'Auckland',
      pipeline_stage: 'Analysis',
      purchase_price: '',
      target_sale_price: '',
      notes: '',
    });
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
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="address">Property Address</Label>
              <Input
                id="address"
                placeholder="123 Queen Street"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="suburb">Suburb</Label>
              <Input
                id="suburb"
                placeholder="Ponsonby"
                value={formData.suburb}
                onChange={(e) => setFormData({ ...formData, suburb: e.target.value })}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auckland">Auckland</SelectItem>
                  <SelectItem value="Wellington">Wellington</SelectItem>
                  <SelectItem value="Christchurch">Christchurch</SelectItem>
                  <SelectItem value="Hamilton">Hamilton</SelectItem>
                  <SelectItem value="Tauranga">Tauranga</SelectItem>
                  <SelectItem value="Dunedin">Dunedin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
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
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="purchase_price">Purchase Price (NZD)</Label>
              <Input
                id="purchase_price"
                type="number"
                placeholder="850000"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="target_sale_price">Target Sale Price (NZD)</Label>
              <Input
                id="target_sale_price"
                type="number"
                placeholder="1200000"
                value={formData.target_sale_price}
                onChange={(e) => setFormData({ ...formData, target_sale_price: e.target.value })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes about this property..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
              {isCreating ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateDealDialog;
