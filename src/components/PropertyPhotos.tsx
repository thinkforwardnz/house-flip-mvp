
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';

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
      <Card className="overflow-hidden bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-0">
          <div className="relative h-80 bg-gray-100">
            <img
              src={`https://images.unsplash.com/${photos[selectedPhoto]}?auto=format&fit=crop&w=800&q=80`}
              alt={`Property photo ${selectedPhoto + 1}`}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-md text-sm font-medium">
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
            className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
              selectedPhoto === index 
                ? 'border-[#1B5E20] shadow-md' 
                : 'border-gray-200 hover:border-gray-300'
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
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">{address}</h2>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500 font-medium">List Price:</span>
              <p className="font-semibold text-lg text-[#1B5E20] mt-1">
                ${listingDetails.price.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Square Feet:</span>
              <p className="font-medium text-gray-900 mt-1">{listingDetails.sqft.toLocaleString()} sq ft</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Bedrooms:</span>
              <p className="font-medium text-gray-900 mt-1">{listingDetails.bedrooms} bed</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Bathrooms:</span>
              <p className="font-medium text-gray-900 mt-1">{listingDetails.bathrooms} bath</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Year Built:</span>
              <p className="font-medium text-gray-900 mt-1">{listingDetails.yearBuilt}</p>
            </div>
            <div>
              <span className="text-gray-500 font-medium">Lot Size:</span>
              <p className="font-medium text-gray-900 mt-1">{listingDetails.lotSize}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyPhotos;
