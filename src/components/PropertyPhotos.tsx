
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface PropertyPhotosProps {
  photos: string[];
  address: string;
  listingDetails: {
    price: number;
    bedrooms: number;
    bathrooms: number;
    sqft: number;
    yearBuilt: number;
    lotSize: string;
  };
}

const PropertyPhotos = ({ photos, address, listingDetails }: PropertyPhotosProps) => {
  const [selectedPhoto, setSelectedPhoto] = useState(0);

  return (
    <div className="space-y-4">
      {/* Main Photo */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-80 bg-gray-100">
            <img
              src={`https://images.unsplash.com/${photos[selectedPhoto]}?auto=format&fit=crop&w=800&q=80`}
              alt={`Property photo ${selectedPhoto + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {selectedPhoto + 1} / {photos.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Photo Thumbnails */}
      <div className="grid grid-cols-4 gap-2">
        {photos.map((photo, index) => (
          <button
            key={index}
            onClick={() => setSelectedPhoto(index)}
            className={`relative h-20 rounded-lg overflow-hidden border-2 transition-colors ${
              selectedPhoto === index ? 'border-[#1B5E20]' : 'border-gray-200'
            }`}
          >
            <img
              src={`https://images.unsplash.com/${photo}?auto=format&fit=crop&w=200&q=80`}
              alt={`Thumbnail ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Property Details */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{address}</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">List Price:</span>
              <p className="font-semibold text-lg text-[#1B5E20]">
                ${listingDetails.price.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500">Square Feet:</span>
              <p className="font-medium">{listingDetails.sqft.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-gray-500">Bedrooms:</span>
              <p className="font-medium">{listingDetails.bedrooms} bed</p>
            </div>
            <div>
              <span className="text-gray-500">Bathrooms:</span>
              <p className="font-medium">{listingDetails.bathrooms} bath</p>
            </div>
            <div>
              <span className="text-gray-500">Year Built:</span>
              <p className="font-medium">{listingDetails.yearBuilt}</p>
            </div>
            <div>
              <span className="text-gray-500">Lot Size:</span>
              <p className="font-medium">{listingDetails.lotSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyPhotos;
