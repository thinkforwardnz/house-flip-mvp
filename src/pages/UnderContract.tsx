
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Under Contract</h1>
        <p className="text-blue-100 text-lg">{propertyData.address}</p>
      </div>

      {/* Property Summary */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <PropertySummary property={propertyData} />
        </CardContent>
      </Card>

      {/* Status Dashboard */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <StatusDashboard />
        </CardContent>
      </Card>

      {/* Reminders */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <DueDiligenceReminders />
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
        
        <CardContent className="p-6 pt-0">
          {activeSection === 'checklist' && <DueDiligenceChecklist />}
          {activeSection === 'budget' && <BudgetAdjustment />}
          {activeSection === 'ai-review' && <AIReviewSummary />}
          {activeSection === 'tasks' && <TaskLog />}
        </CardContent>
      </Card>

      {/* Action Button */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <div className="flex justify-end">
            <Button 
              className="bg-blue-primary hover:bg-blue-secondary text-white font-medium rounded-xl px-8"
              onClick={() => navigate('/renovation')}
            >
              Move to Renovation →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnderContract;
