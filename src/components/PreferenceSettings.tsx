
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Save, MapPin, DollarSign, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PreferenceSettings = () => {
  const { toast } = useToast();
  const [preferences, setPreferences] = useState({
    defaultRegions: ['Auckland', 'Wellington'],
    budgetMin: '500000',
    budgetMax: '1200000',
    currency: 'NZD',
    propertyTypes: ['house', 'townhouse', 'apartment'],
    pipelineView: 'kanban',
    autoCalculateROI: true,
    showGSTInclusive: true,
    defaultHoldPeriod: '6',
  });

  const regions = [
    'Wellington',
    'Auckland',
    'Canterbury',
    'Bay of Plenty',
    'Waikato',
    'Otago',
    'Manawatu-Wanganui',
    'Northland',
    'Hawke\'s Bay',
    'Taranaki',
    'Nelson',
    'Marlborough',
    'Southland',
    'Tasman',
    'Gisborne',
    'West Coast'
  ];

  const propertyTypes = [
    { id: 'house', label: 'House' },
    { id: 'townhouse', label: 'Townhouse' },
    { id: 'apartment', label: 'Apartment' },
    { id: 'unit', label: 'Unit' },
    { id: 'section', label: 'Section/Land' }
  ];

  const handleRegionToggle = (region: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      defaultRegions: checked 
        ? [...prev.defaultRegions, region]
        : prev.defaultRegions.filter(r => r !== region)
    }));
  };

  const handlePropertyTypeToggle = (type: string, checked: boolean) => {
    setPreferences(prev => ({
      ...prev,
      propertyTypes: checked 
        ? [...prev.propertyTypes, type]
        : prev.propertyTypes.filter(t => t !== type)
    }));
  };

  const handleSave = () => {
    toast({
      title: "Preferences Updated",
      description: "Your default preferences have been saved successfully.",
    });
  };

  return (
    <div className="space-y-6">
      {/* Default Regions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Default Search Regions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {regions.map((region) => (
              <div key={region} className="flex items-center space-x-2">
                <Checkbox
                  id={region}
                  checked={preferences.defaultRegions.includes(region)}
                  onCheckedChange={(checked) => handleRegionToggle(region, checked as boolean)}
                />
                <Label htmlFor={region} className="text-sm">{region}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Budget Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Budget Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budgetMin">Minimum Budget</Label>
              <Input
                id="budgetMin"
                type="number"
                value={preferences.budgetMin}
                onChange={(e) => setPreferences(prev => ({ ...prev, budgetMin: e.target.value }))}
                placeholder="500000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="budgetMax">Maximum Budget</Label>
              <Input
                id="budgetMax"
                type="number"
                value={preferences.budgetMax}
                onChange={(e) => setPreferences(prev => ({ ...prev, budgetMax: e.target.value }))}
                placeholder="1200000"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Select value={preferences.currency} onValueChange={(value) => setPreferences(prev => ({ ...prev, currency: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="NZD">NZD - New Zealand Dollar</SelectItem>
                <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                <SelectItem value="USD">USD - US Dollar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="holdPeriod">Default Hold Period (months)</Label>
            <Input
              id="holdPeriod"
              type="number"
              value={preferences.defaultHoldPeriod}
              onChange={(e) => setPreferences(prev => ({ ...prev, defaultHoldPeriod: e.target.value }))}
              placeholder="6"
            />
          </div>
        </CardContent>
      </Card>

      {/* Property Types */}
      <Card>
        <CardHeader>
          <CardTitle>Property Type Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {propertyTypes.map((type) => (
              <div key={type.id} className="flex items-center space-x-2">
                <Checkbox
                  id={type.id}
                  checked={preferences.propertyTypes.includes(type.id)}
                  onCheckedChange={(checked) => handlePropertyTypeToggle(type.id, checked as boolean)}
                />
                <Label htmlFor={type.id} className="text-sm">{type.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Pipeline & Display Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pipelineView">Default Pipeline View</Label>
            <Select value={preferences.pipelineView} onValueChange={(value) => setPreferences(prev => ({ ...prev, pipelineView: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kanban">Kanban Board</SelectItem>
                <SelectItem value="list">List View</SelectItem>
                <SelectItem value="calendar">Calendar View</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="autoCalculateROI"
                checked={preferences.autoCalculateROI}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, autoCalculateROI: checked as boolean }))}
              />
              <Label htmlFor="autoCalculateROI">Auto-calculate ROI estimates</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="showGSTInclusive"
                checked={preferences.showGSTInclusive}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, showGSTInclusive: checked as boolean }))}
              />
              <Label htmlFor="showGSTInclusive">Show GST-inclusive prices by default</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} className="bg-[#1B5E20] hover:bg-[#1B5E20]/90">
        <Save className="h-4 w-4 mr-2" />
        Save Preferences
      </Button>
    </div>
  );
};

export default PreferenceSettings;
