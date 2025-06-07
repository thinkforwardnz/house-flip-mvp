
import React from 'react';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SourceSelectorProps {
  selectedSources: string[];
  onSourceChange: (source: string, checked: boolean) => void;
}

const SourceSelector = ({ selectedSources, onSourceChange }: SourceSelectorProps) => {
  return (
    <div className="mb-4">
      <Label className="text-sm font-medium mb-2 block">Property Sources</Label>
      <div className="flex gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="trademe"
            checked={selectedSources.includes('trademe')}
            onCheckedChange={(checked) => onSourceChange('trademe', checked as boolean)}
          />
          <Label htmlFor="trademe" className="text-sm">TradeMe</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="realestate"
            checked={selectedSources.includes('realestate')}
            onCheckedChange={(checked) => onSourceChange('realestate', checked as boolean)}
          />
          <Label htmlFor="realestate" className="text-sm">Realestate.co.nz</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="oneroof"
            checked={selectedSources.includes('oneroof')}
            onCheckedChange={(checked) => onSourceChange('oneroof', checked as boolean)}
          />
          <Label htmlFor="oneroof" className="text-sm">OneRoof</Label>
        </div>
      </div>
    </div>
  );
};

export default SourceSelector;
