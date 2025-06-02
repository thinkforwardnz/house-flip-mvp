
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import PropertySummary from '@/components/PropertySummary';
import MarketingDashboard from '@/components/MarketingDashboard';
import BuyerOffersTable from '@/components/BuyerOffersTable';
import OpenHomeFeedback from '@/components/OpenHomeFeedback';
import SalesAISummary from '@/components/SalesAISummary';
import CampaignCalendar from '@/components/CampaignCalendar';

const Listed = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('offers');

  const propertyData = {
    address: '1234 Elm Street, Auckland, 1010',
    listPrice: 650000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    aiRiskLevel: 'Low' as const,
    estimatedProfit: 85000,
    roi: 18.5
  };

  const sections = [
    { id: 'offers', label: 'Buyer Offers' },
    { id: 'feedback', label: 'Open Home Feedback' },
    { id: 'ai-summary', label: 'AI Insights' },
    { id: 'calendar', label: 'Campaign Calendar' }
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Listed for Sale</h1>
        <p className="text-blue-100 text-lg">{propertyData.address}</p>
      </div>

      {/* Property Summary */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <PropertySummary property={propertyData} />
        </CardContent>
      </Card>

      {/* Marketing Dashboard */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <MarketingDashboard />
        </CardContent>
      </Card>

      {/* Tab Navigation and Content */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${
                  activeSection === section.id
                    ? 'bg-blue-primary text-white'
                    : 'text-navy hover:text-navy-dark'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 min-h-[600px]">
          {activeSection === 'offers' && <BuyerOffersTable />}
          {activeSection === 'feedback' && <OpenHomeFeedback />}
          {activeSection === 'ai-summary' && <SalesAISummary />}
          {activeSection === 'calendar' && <CampaignCalendar />}
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex justify-end">
            <Button 
              className="bg-green-success hover:bg-green-600 text-white font-medium rounded-xl px-8"
              onClick={() => navigate('/sold')}
            >
              Mark as Sold →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Listed;
