
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PropertySummary from '@/components/PropertySummary';
import DueDiligenceChecklist from '@/components/DueDiligenceChecklist';
import StatusDashboard from '@/components/StatusDashboard';
import BudgetAdjustment from '@/components/BudgetAdjustment';
import AIReviewSummary from '@/components/AIReviewSummary';
import TaskLog from '@/components/TaskLog';
import DueDiligenceReminders from '@/components/DueDiligenceReminders';

const UnderContract = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('checklist');

  // Mock property data
  const propertyData = {
    address: '1234 Elm Street, Auckland, 1010',
    listPrice: 650000,
    bedrooms: 3,
    bathrooms: 2,
    sqft: 1200,
    aiRiskLevel: 'Medium' as const,
    estimatedProfit: 85000,
    roi: 18.5
  };

  const sections = [
    { id: 'checklist', label: 'Due Diligence' },
    { id: 'budget', label: 'Budget Updates' },
    { id: 'ai-review', label: 'AI Review' },
    { id: 'tasks', label: 'Tasks & Notes' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-[Inter]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/offer')}
            className="text-gray-600 hover:text-gray-900 border-gray-300"
          >
            ← Back to Offer
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Under Contract</h1>
            <p className="text-sm text-gray-500 mt-1">{propertyData.address}</p>
          </div>
          <Button 
            className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white"
            onClick={() => navigate('/renovation')}
          >
            Move to Renovation →
          </Button>
        </div>
      </div>

      {/* Property Summary */}
      <div className="max-w-7xl mx-auto p-6">
        <PropertySummary property={propertyData} />
      </div>

      {/* Status Dashboard */}
      <div className="max-w-7xl mx-auto px-6">
        <StatusDashboard />
      </div>

      {/* Reminders */}
      <div className="max-w-7xl mx-auto px-6">
        <DueDiligenceReminders />
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSection === section.id
                    ? 'border-[#1B5E20] text-[#1B5E20]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 min-h-[600px]">
          {activeSection === 'checklist' && <DueDiligenceChecklist />}
          {activeSection === 'budget' && <BudgetAdjustment />}
          {activeSection === 'ai-review' && <AIReviewSummary />}
          {activeSection === 'tasks' && <TaskLog />}
        </div>
      </div>
    </div>
  );
};

export default UnderContract;
