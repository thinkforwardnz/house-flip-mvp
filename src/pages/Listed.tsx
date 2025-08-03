import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import PropertySummary from '@/components/PropertySummary';
import MarketingDashboard from '@/components/MarketingDashboard';
import BuyerOffersTable from '@/components/BuyerOffersTable';
import OpenHomeFeedback from '@/components/OpenHomeFeedback';
import SalesAISummary from '@/components/SalesAISummary';
import CampaignCalendar from '@/components/CampaignCalendar';
import { Building, MapPin } from 'lucide-react';
const Listed = () => {
  const navigate = useNavigate();
  const {
    selectedDeal,
    selectedDealId,
    selectDeal,
    isLoading
  } = useSelectedDeal('Listed');
  const [activeSection, setActiveSection] = useState('offers');
  const sections = [{
    id: 'offers',
    label: 'Buyer Offers'
  }, {
    id: 'feedback',
    label: 'Open Home Feedback'
  }, {
    id: 'ai-summary',
    label: 'AI Insights'
  }, {
    id: 'calendar',
    label: 'Campaign Calendar'
  }];
  if (isLoading) {
    return <div className="w-[1280px] mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>;
  }
  if (!selectedDeal) {
    return <div className="w-[1280px] mx-auto space-y-6">
        <PropertySelector currentDealId={selectedDealId} onDealSelect={selectDeal} currentStage="Listed" />
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-12 text-center">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-navy-dark mb-2">No Properties Listed</h3>
            <p className="text-navy mb-6">There are no properties currently listed for sale.</p>
            <Button onClick={() => navigate('/renovation')} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
              Go to Renovation
            </Button>
          </CardContent>
        </Card>
      </div>;
  }
  const propertyData = {
    address: selectedDeal?.address,
    listPrice: selectedDeal?.target_sale_price || 0,
    bedrooms: 3,
    // This would come from property details if available
    bathrooms: 2,
    sqft: 1200,
    aiRiskLevel: selectedDeal?.current_risk as 'Low' | 'Medium' | 'High',
    estimatedProfit: selectedDeal?.current_profit || 0,
    roi: selectedDeal?.purchase_price && selectedDeal?.current_profit ? selectedDeal.current_profit / selectedDeal.purchase_price * 100 : 0
  };
  return <div className="w-[1280px] mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-700 mb-2">Listed for Sale</h1>
        <p className="text-lg text-slate-700">Manage marketing and buyer interactions for listed properties</p>
      </div>

      {/* Property Selector */}
      <PropertySelector currentDealId={selectedDealId} onDealSelect={selectDeal} currentStage="Listed" />

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
            {sections.map(section => <button key={section.id} onClick={() => setActiveSection(section.id)} className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors ${activeSection === section.id ? 'bg-blue-primary text-white' : 'text-navy hover:text-navy-dark'}`}>
                {section.label}
              </button>)}
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
            <Button className="bg-green-success hover:bg-green-600 text-white font-medium rounded-xl px-8" onClick={() => navigate('/sold')}>
              Mark as Sold →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
};
export default Listed;