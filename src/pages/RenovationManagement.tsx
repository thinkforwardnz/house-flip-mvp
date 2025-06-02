
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import TaskKanban from '@/components/TaskKanban';
import TradieScheduler from '@/components/TradieScheduler';
import BudgetTracker from '@/components/BudgetTracker';
import FileUpload from '@/components/FileUpload';
import ComplianceChecklist from '@/components/ComplianceChecklist';
import AIAlerts from '@/components/AIAlerts';

const RenovationManagement = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('tasks');

  // Mock project data
  const projectData = {
    name: '1234 Elm Street Renovation',
    address: '1234 Elm Street, Auckland, 1010',
    budget: 85000,
    actualSpent: 72500,
    startDate: '2024-01-15',
    endDate: '2024-03-30'
  };

  const tabs = [
    { id: 'tasks', label: 'Tasks & Timeline' },
    { id: 'tradies', label: 'Tradie Scheduler' },
    { id: 'budget', label: 'Budget Tracker' },
    { id: 'files', label: 'Files & Photos' },
    { id: 'compliance', label: 'Compliance' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-[Inter]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-900 border-gray-300"
          >
            ← Back to Dashboard
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">{projectData.name}</h1>
            <p className="text-sm text-gray-500 mt-1">{projectData.address}</p>
          </div>
          <div className="w-32" />
        </div>
      </div>

      {/* AI Alerts */}
      <div className="max-w-7xl mx-auto p-6">
        <AIAlerts />
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-[#1B5E20] text-[#1B5E20]'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-7xl mx-auto px-6 pb-6">
        <div className="bg-white rounded-b-lg shadow-sm border border-gray-200 border-t-0 min-h-[600px]">
          {activeTab === 'tasks' && <TaskKanban />}
          {activeTab === 'tradies' && <TradieScheduler />}
          {activeTab === 'budget' && <BudgetTracker budget={projectData.budget} actualSpent={projectData.actualSpent} />}
          {activeTab === 'files' && <FileUpload />}
          {activeTab === 'compliance' && <ComplianceChecklist />}
        </div>
      </div>
    </div>
  );
};

export default RenovationManagement;
