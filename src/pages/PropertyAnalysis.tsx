
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PropertyPhotos from '@/components/PropertyPhotos';
import AISummary from '@/components/AISummary';
import AnalysisForm from '@/components/AnalysisForm';
import ProfitCalculator from '@/components/ProfitCalculator';

const PropertyAnalysis = () => {
  const navigate = useNavigate();
  
  // Mock property data - in real app this would come from props/params
  const propertyData = {
    photos: [
      'photo-1487958449943-2429e8be8625',
      'photo-1460574283810-2aab119d8511',
      'photo-1721322800607-8c38375eef04',
      'photo-1649972904349-6e44c42644a7'
    ],
    address: '1234 Elm Street, Auckland, 1010',
    listingDetails: {
      price: 850000,
      bedrooms: 3,
      bathrooms: 2,
      sqft: 1850,
      yearBuilt: 1995,
      lotSize: '0.25 acres'
    }
  };

  const [analysisData, setAnalysisData] = useState({
    offerPrice: 720000,
    renoEstimate: 85000,
    timeline: 6,
    holdingCosts: 3500,
    sellingCosts: 45000,
    addBedroom: false,
    bedroomCost: 25000,
    notes: ''
  });

  const aiSummary = {
    summary: 'Potential Flip',
    confidence: 'High' as const,
    keyInsights: [
      'Property is in desirable neighbourhood with strong comps',
      'Kitchen and bathrooms need significant updates',
      'Adding a bedroom could increase value by $150k+',
      'Market conditions favour quick turnaround'
    ]
  };

  const handleSave = () => {
    // In real app, save to database
    console.log('Saving analysis:', analysisData);
  };

  const handleMoveToOffer = () => {
    // In real app, update property status and redirect
    console.log('Moving to offer stage');
    navigate('/');
  };

  const handleDismiss = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-[Inter]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="text-gray-600"
          >
            ← Back to Dashboard
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">Property Analysis</h1>
          <div className="w-32" /> {/* Spacer for alignment */}
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* AI Summary */}
        <div className="mb-6">
          <AISummary 
            summary={aiSummary.summary}
            confidence={aiSummary.confidence}
            keyInsights={aiSummary.keyInsights}
          />
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Property Photos & Details */}
          <div>
            <PropertyPhotos 
              photos={propertyData.photos}
              address={propertyData.address}
              listingDetails={propertyData.listingDetails}
            />
          </div>

          {/* Right Column - Analysis Form & Calculator */}
          <div className="space-y-6">
            <AnalysisForm 
              data={analysisData}
              onChange={setAnalysisData}
            />

            <ProfitCalculator 
              listPrice={propertyData.listingDetails.price}
              offerPrice={analysisData.offerPrice}
              renoEstimate={analysisData.renoEstimate}
              timeline={analysisData.timeline}
              holdingCosts={analysisData.holdingCosts}
              sellingCosts={analysisData.sellingCosts}
              addBedroom={analysisData.addBedroom}
              bedroomCost={analysisData.bedroomCost}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center lg:justify-end">
          <Button 
            variant="outline" 
            onClick={handleDismiss}
            className="min-w-24"
          >
            Dismiss
          </Button>
          <Button 
            variant="secondary" 
            onClick={handleSave}
            className="min-w-24 bg-gray-100 hover:bg-gray-200"
          >
            Save
          </Button>
          <Button 
            onClick={handleMoveToOffer}
            className="min-w-32 bg-[#FF9800] hover:bg-[#FF9800]/90 text-white"
          >
            Move to Offer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PropertyAnalysis;
