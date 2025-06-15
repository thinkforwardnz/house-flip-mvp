
import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { UnifiedProperty } from '@/hooks/useUnifiedProperties';

interface KeywordTagFilterProps {
  properties: UnifiedProperty[];
  selectedKeywords: string[];
  onKeywordToggle: (keyword: string) => void;
  onClearAll: () => void;
}

const KeywordTagFilter = ({ 
  properties, 
  selectedKeywords, 
  onKeywordToggle, 
  onClearAll 
}: KeywordTagFilterProps) => {
  const [availableKeywords, setAvailableKeywords] = useState<string[]>([]);

  useEffect(() => {
    // Extract all keyword tags from properties (excluding system tags)
    const systemTags = ['prospecting', 'saved', 'dismissed', 'deal', 'analysis', 'offer', 'under_contract', 'renovation', 'listed', 'sold'];
    const allTags = new Set<string>();
    
    properties.forEach(property => {
      property.tags.forEach(tag => {
        if (!systemTags.includes(tag) && tag.length > 0) {
          allTags.add(tag);
        }
      });
    });
    
    setAvailableKeywords(Array.from(allTags).sort());
  }, [properties]);

  if (availableKeywords.length === 0) {
    return null;
  }

  return (
    <div className="bg-white p-4 rounded-lg border space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Filter by Search Keywords</h3>
        </div>
        {selectedKeywords.length > 0 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClearAll}
            className="text-xs"
          >
            Clear All
          </Button>
        )}
      </div>
      
      <div className="flex flex-wrap gap-2">
        {availableKeywords.map(keyword => {
          const isSelected = selectedKeywords.includes(keyword);
          return (
            <Badge
              key={keyword}
              variant={isSelected ? "default" : "secondary"}
              className={`cursor-pointer flex items-center gap-1 ${
                isSelected 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              onClick={() => onKeywordToggle(keyword)}
            >
              {keyword}
              {isSelected && (
                <X className="h-3 w-3 ml-1" />
              )}
            </Badge>
          );
        })}
      </div>
      
      {selectedKeywords.length > 0 && (
        <p className="text-xs text-gray-600">
          Showing properties tagged with: {selectedKeywords.join(', ')}
        </p>
      )}
    </div>
  );
};

export default KeywordTagFilter;
