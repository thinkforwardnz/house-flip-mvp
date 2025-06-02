
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    console.log('Saving analysis:', analysisData);
  };

  const handleMoveToOffer = () => {
    console.log('Moving to offer stage');
    navigate('/offer');
  };

  const handleDismiss = () => {
    navigate('/find');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Property Analysis</h1>
        <p className="text-blue-100 text-lg">{propertyData.address}</p>
      </div>

      {/* AI Summary */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <AISummary 
            summary={aiSummary.summary}
            confidence={aiSummary.confidence}
            keyInsights={aiSummary.keyInsights}
          />
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Property Photos & Details */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <PropertyPhotos 
              photos={propertyData.photos}
              address={propertyData.address}
              listingDetails={propertyData.listingDetails}
            />
          </CardContent>
        </Card>

        {/* Right Column - Analysis Form & Calculator */}
        <div className="space-y-6">
          <Card className="bg-white shadow-lg rounded-2xl border-0">
            <CardHeader className="p-6">
              <CardTitle className="text-navy-dark">Analysis Details</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <AnalysisForm 
                data={analysisData}
                onChange={setAnalysisData}
              />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg rounded-2xl border-0">
            <CardHeader className="p-6">
              <CardTitle className="text-navy-dark">Profit Calculator</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4 justify-center lg:justify-end">
            <Button 
              variant="outline" 
              onClick={handleDismiss}
              className="min-w-24 rounded-xl"
            >
              Dismiss
            </Button>
            <Button 
              variant="outline" 
              onClick={handleSave}
              className="min-w-24 rounded-xl"
            >
              Save Analysis
            </Button>
            <Button 
              onClick={handleMoveToOffer}
              className="min-w-32 bg-blue-primary hover:bg-blue-secondary text-white font-medium rounded-xl"
            >
              Move to Offer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyAnalysis;
