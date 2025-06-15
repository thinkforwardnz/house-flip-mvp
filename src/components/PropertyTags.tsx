
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Plus, Tag } from 'lucide-react';
import { UnifiedProperty } from '@/hooks/useUnifiedProperties';

interface PropertyTagsProps {
  property: UnifiedProperty;
  onAddTag: (propertyId: string, tag: string) => void;
  onRemoveTag: (propertyId: string, tag: string) => void;
  isUpdating?: boolean;
  showAddTag?: boolean;
}

const PropertyTags = ({ 
  property, 
  onAddTag, 
  onRemoveTag, 
  isUpdating = false,
  showAddTag = true 
}: PropertyTagsProps) => {
  const [newTag, setNewTag] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !property.tags.includes(newTag.trim().toLowerCase())) {
      onAddTag(property.id, newTag.trim().toLowerCase());
      setNewTag('');
      setIsAdding(false);
    }
  };

  const handleRemoveTag = (tag: string) => {
    // Prevent removal of core system tags
    const systemTags = ['prospecting', 'deal', 'analysis', 'offer', 'under_contract', 'renovation', 'listed', 'sold'];
    if (!systemTags.includes(tag)) {
      onRemoveTag(property.id, tag);
    }
  };

  const getTagColor = (tag: string) => {
    const systemTags = ['prospecting', 'deal', 'analysis', 'offer', 'under_contract', 'renovation', 'listed', 'sold'];
    
    // Check if it's a keyword tag (not a system tag)
    if (!systemTags.includes(tag) && !['saved', 'dismissed', 'recent_sale', 'linz_enriched', 'council_enriched', 'market_analyzed'].includes(tag)) {
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    
    switch (tag) {
      case 'prospecting':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'saved':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dismissed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'deal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'analysis':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'offer':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'under_contract':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'renovation':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'listed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'sold':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'recent_sale':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'linz_enriched':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'council_enriched':
        return 'bg-cyan-100 text-cyan-800 border-cyan-200';
      case 'market_analyzed':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const isSystemTag = (tag: string) => {
    const systemTags = ['prospecting', 'deal', 'analysis', 'offer', 'under_contract', 'renovation', 'listed', 'sold'];
    return systemTags.includes(tag);
  };

  const isKeywordTag = (tag: string) => {
    const systemTags = ['prospecting', 'deal', 'analysis', 'offer', 'under_contract', 'renovation', 'listed', 'sold'];
    const otherTags = ['saved', 'dismissed', 'recent_sale', 'linz_enriched', 'council_enriched', 'market_analyzed'];
    return !systemTags.includes(tag) && !otherTags.includes(tag);
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {property.tags.map((tag) => (
          <Badge 
            key={tag} 
            className={`${getTagColor(tag)} flex items-center gap-1 text-xs`}
          >
            {isKeywordTag(tag) && <Tag className="h-3 w-3" />}
            {tag.replace('_', ' ')}
            {!isSystemTag(tag) && (
              <button
                onClick={() => handleRemoveTag(tag)}
                disabled={isUpdating}
                className="ml-1 hover:bg-red-200 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </Badge>
        ))}
      </div>

      {showAddTag && (
        <div className="flex items-center gap-2">
          {isAdding ? (
            <>
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Enter tag name"
                className="h-8 text-xs"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                autoFocus
              />
              <Button 
                size="sm" 
                onClick={handleAddTag}
                disabled={!newTag.trim() || isUpdating}
                className="h-8"
              >
                Add
              </Button>
              <Button 
                variant="outline"
                size="sm" 
                onClick={() => {
                  setIsAdding(false);
                  setNewTag('');
                }}
                className="h-8"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="h-8 text-xs"
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Tag
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyTags;
