
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import PropertySelector from '@/components/PropertySelector';
import { useSelectedDeal } from '@/hooks/useSelectedDeal';
import TaskKanban from '@/components/TaskKanban';
import TradieScheduler from '@/components/TradieScheduler';
import BudgetTracker from '@/components/BudgetTracker';
import FileUpload from '@/components/FileUpload';
import ComplianceChecklist from '@/components/ComplianceChecklist';
import AIAlerts from '@/components/AIAlerts';
import { Hammer, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RenovationManagement = () => {
  const { selectedDeal, selectedDealId, selectDeal, isLoading } = useSelectedDeal('Reno');
  const [activeTab, setActiveTab] = useState('tasks');

  const tabs = [
    { id: 'tasks', label: 'Tasks & Timeline' },
    { id: 'tradies', label: 'Tradie Scheduler' },
    { id: 'budget', label: 'Budget Tracker' },
    { id: 'files', label: 'Files & Photos' },
    { id: 'compliance', label: 'Compliance' }
  ];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-6"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedDeal) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <PropertySelector 
          currentDealId={selectedDealId}
          onDealSelect={selectDeal}
          currentStage="Reno"
        />
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-12 text-center">
            <Hammer className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-navy-dark mb-2">No Properties in Renovation</h3>
            <p className="text-navy mb-6">There are no properties currently in the renovation stage.</p>
            <Button onClick={() => window.location.href = '/under-contract'} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
              Go to Under Contract
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate project data from deal
  const projectData = {
    name: `${selectedDeal?.address} Renovation`,
    address: `${selectedDeal?.address}, ${selectedDeal?.suburb}, ${selectedDeal?.city}`,
    budget: 85000, // This could be stored in deal or calculated
    actualSpent: 72500, // This would come from renovation records
    startDate: '2024-01-15', // This would come from deal data
    endDate: '2024-03-30'
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Property Selector */}
      <PropertySelector 
        currentDealId={selectedDealId}
        onDealSelect={selectDeal}
        currentStage="Reno"
      />

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-700 mb-2">{projectData.name}</h1>
        <p className="text-blue-100 text-lg">{projectData.address}</p>
      </div>

      {/* AI Alerts */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <AIAlerts />
        </CardContent>
      </Card>

      {/* Tab Navigation and Content */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardHeader className="p-6">
          <div className="flex space-x-1 bg-gray-100 rounded-xl p-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-blue-primary text-white'
                    : 'text-navy hover:text-navy-dark'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardHeader>
        
        <CardContent className="p-6 pt-0 min-h-[600px]">
          {activeTab === 'tasks' && <TaskKanban />}
          {activeTab === 'tradies' && <TradieScheduler />}
          {activeTab === 'budget' && <BudgetTracker budget={projectData.budget} actualSpent={projectData.actualSpent} />}
          {activeTab === 'files' && <FileUpload />}
          {activeTab === 'compliance' && <ComplianceChecklist />}
        </CardContent>
      </Card>
    </div>
  );
};

export default RenovationManagement;
