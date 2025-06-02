
import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import TaskKanban from '@/components/TaskKanban';
import TradieScheduler from '@/components/TradieScheduler';
import BudgetTracker from '@/components/BudgetTracker';
import FileUpload from '@/components/FileUpload';
import ComplianceChecklist from '@/components/ComplianceChecklist';
import AIAlerts from '@/components/AIAlerts';

const RenovationManagement = () => {
  const [activeTab, setActiveTab] = useState('tasks');

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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{projectData.name}</h1>
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
