
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import KanbanColumn from './KanbanColumn';
import AlertsPanel from './AlertsPanel';

interface Property {
  id: string;
  address: string;
  status: string;
  profit: number;
  risk: 'Low' | 'Medium' | 'High';
  stage: string;
  hasAlert: boolean;
  purchasePrice?: number;
  estimatedValue?: number;
  daysInStage?: number;
}

const PropertyDashboard = () => {
  const [properties] = useState<Property[]>([
    {
      id: '1',
      address: '123 Oak Street, Downtown',
      status: 'Active',
      profit: 45000,
      risk: 'Low',
      stage: 'Analysis',
      hasAlert: false,
      purchasePrice: 150000,
      estimatedValue: 220000,
      daysInStage: 5
    },
    {
      id: '2',
      address: '456 Pine Avenue, Suburbs',
      status: 'Active',
      profit: 32000,
      risk: 'Medium',
      stage: 'Offer',
      hasAlert: true,
      purchasePrice: 180000,
      estimatedValue: 235000,
      daysInStage: 12
    },
    {
      id: '3',
      address: '789 Elm Drive, Midtown',
      status: 'Active',
      profit: 58000,
      risk: 'Low',
      stage: 'Under Contract',
      hasAlert: false,
      purchasePrice: 165000,
      estimatedValue: 250000,
      daysInStage: 8
    },
    {
      id: '4',
      address: '321 Maple Court, Eastside',
      status: 'Active',
      profit: 28000,
      risk: 'High',
      stage: 'Reno',
      hasAlert: true,
      purchasePrice: 140000,
      estimatedValue: 195000,
      daysInStage: 45
    },
    {
      id: '5',
      address: '654 Birch Lane, Westend',
      status: 'Active',
      profit: 67000,
      risk: 'Low',
      stage: 'Listed',
      hasAlert: false,
      purchasePrice: 175000,
      estimatedValue: 275000,
      daysInStage: 23
    },
    {
      id: '6',
      address: '987 Cedar Road, Northside',
      status: 'Completed',
      profit: 42000,
      risk: 'Low',
      stage: 'Sold',
      hasAlert: false,
      purchasePrice: 160000,
      estimatedValue: 230000,
      daysInStage: 120
    }
  ]);

  const stages = [
    { name: 'Analysis', color: 'bg-blue-100 text-blue-800' },
    { name: 'Offer', color: 'bg-yellow-100 text-yellow-800' },
    { name: 'Under Contract', color: 'bg-purple-100 text-purple-800' },
    { name: 'Reno', color: 'bg-orange-100 text-orange-800' },
    { name: 'Listed', color: 'bg-indigo-100 text-indigo-800' },
    { name: 'Sold', color: 'bg-green-100 text-green-800' }
  ];

  const getPropertiesByStage = (stageName: string) => {
    return properties.filter(property => property.stage === stageName);
  };

  const handleAddProperty = () => {
    console.log('Add new property clicked');
    // Implementation for adding new property would go here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <div className="max-w-full mx-auto">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-4">
          <div className="flex items-center justify-between lg:justify-start">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">Property Pipeline</h1>
              <p className="text-gray-600 mt-1">Manage your property flipping projects</p>
            </div>
            <div className="lg:hidden">
              <AlertsPanel />
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Button 
              onClick={handleAddProperty}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              Add New Property
            </Button>
            <div className="hidden lg:block">
              <AlertsPanel />
            </div>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{properties.length}</div>
            <div className="text-sm text-gray-500">Total Properties</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              ${properties.reduce((sum, p) => sum + p.profit, 0).toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Profit</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {properties.filter(p => p.stage !== 'Sold').length}
            </div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </div>
          <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div className="text-2xl font-bold text-amber-600">
              {properties.filter(p => p.hasAlert).length}
            </div>
            <div className="text-sm text-gray-500">Alerts</div>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex flex-col lg:flex-row gap-4 overflow-x-auto lg:overflow-x-visible">
          {stages.map((stage) => {
            const stageProperties = getPropertiesByStage(stage.name);
            return (
              <KanbanColumn
                key={stage.name}
                title={stage.name}
                properties={stageProperties}
                count={stageProperties.length}
                color={stage.color}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PropertyDashboard;
