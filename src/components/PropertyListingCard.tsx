
import React from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Plus, X, ExternalLink, Bed, Bath, Home, MapPin } from 'lucide-react';

interface PropertyListingCardProps {
  property: {
    id: string;
    address: string;
    suburb: string;
    city: string;
    price: number;
    bedrooms: number;
    bathrooms: number;
    floorArea: number;
    landArea: number;
    imageUrl: string;
    listingUrl: string;
    description: string;
    aiAnalysis: {
      renovationCost: number;
      arv: number;
      projectedProfit: number;
      flipPotential: 'High' | 'Medium' | 'Low';
      confidence: number;
    };
    source: string;
    listedDate: string;
  };
  onImportAsDeal: () => void;
  onSaveForLater: () => void;
  onDismiss: () => void;
}

const PropertyListingCard = ({ property, onImportAsDeal, onSaveForLater, onDismiss }: PropertyListingCardProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPotentialBadgeColor = (potential: string) => {
    switch (potential) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 relative overflow-hidden">
      <div className="relative">
        <img 
          src={property.imageUrl} 
          alt={property.address}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${getPotentialBadgeColor(property.aiAnalysis.flipPotential)} text-xs font-semibold`}>
            {property.aiAnalysis.flipPotential} Potential
          </Badge>
        </div>
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-800 text-xs">
            {property.source}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-sm leading-tight mb-1">
            {property.address}
          </h3>
          <div className="flex items-center text-xs text-gray-500">
            <MapPin className="h-3 w-3 mr-1" />
            {property.suburb}, {property.city}
          </div>
        </div>
        
        <div className="mb-3">
          <div className="text-lg font-bold text-gray-900 mb-1">
            {formatCurrency(property.price)}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <div className="flex items-center">
              <Bed className="h-3 w-3 mr-1" />
              {property.bedrooms}
            </div>
            <div className="flex items-center">
              <Bath className="h-3 w-3 mr-1" />
              {property.bathrooms}
            </div>
            <div className="flex items-center">
              <Home className="h-3 w-3 mr-1" />
              {property.floorArea}m²
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-3 mb-3">
          <h4 className="text-xs font-semibold text-gray-700 mb-2">AI Analysis</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-600">Reno Cost:</span>
              <span className="font-medium">{formatCurrency(property.aiAnalysis.renovationCost)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">ARV:</span>
              <span className="font-medium">{formatCurrency(property.aiAnalysis.arv)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Projected Profit:</span>
              <span className={`font-semibold ${property.aiAnalysis.projectedProfit > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(property.aiAnalysis.projectedProfit)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Confidence:</span>
              <span className="font-medium">{property.aiAnalysis.confidence}%</span>
            </div>
          </div>
        </div>
        
        <p className="text-xs text-gray-600 line-clamp-2 mb-3">
          {property.description}
        </p>
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <div className="flex flex-col gap-2 w-full">
          <div className="flex gap-2">
            <Button 
              onClick={onImportAsDeal}
              className="flex-1 bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-xs h-8"
            >
              <Plus className="h-3 w-3 mr-1" />
              Import as Deal
            </Button>
            <Button 
              onClick={onSaveForLater}
              variant="outline" 
              size="sm"
              className="text-xs h-8 px-2"
            >
              <Heart className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex-1 text-xs h-8"
              onClick={() => window.open(property.listingUrl, '_blank')}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Listing
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDismiss}
              className="text-xs h-8 px-2 text-gray-500 hover:text-red-600"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default PropertyListingCard;
