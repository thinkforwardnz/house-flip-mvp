
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

interface DataSourceStatus {
  linz: { status: string; icon: any; color: string };
  trademe: { status: string; icon: any; color: string };
  googleMaps: { status: string; icon: any; color: string };
  council: { status: string; icon: any; color: string };
}

interface DataCollectionTabProps {
  dataSourceStatus: DataSourceStatus;
  isAnalyzing: boolean;
  onRunAnalysis: () => void;
}

const DataCollectionTab = ({ dataSourceStatus, isAnalyzing, onRunAnalysis }: DataCollectionTabProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-navy-dark">Data Collection Status</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-navy-dark">Free Data Sources</h4>
          <div className="space-y-3">
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              dataSourceStatus.linz.status === 'complete' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <span className="text-sm">LINZ Property Data</span>
              <dataSourceStatus.linz.icon className={`h-4 w-4 ${dataSourceStatus.linz.color}`} />
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              dataSourceStatus.trademe.status === 'complete' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <span className="text-sm">Trade Me Listing</span>
              <dataSourceStatus.trademe.icon className={`h-4 w-4 ${dataSourceStatus.trademe.color}`} />
            </div>
            <div className={`flex items-center justify-between p-3 rounded-lg ${
              dataSourceStatus.googleMaps.status === 'complete' ? 'bg-green-50' : 'bg-yellow-50'
            }`}>
              <span className="text-sm">Google Maps Data</span>
              <dataSourceStatus.googleMaps.icon className={`h-4 w-4 ${dataSourceStatus.googleMaps.color}`} />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm">Council GIS Data</span>
              <AlertTriangle className="h-4 w-4 text-gray-600" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-navy-dark">Market Data Sources</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm">homes.co.nz</span>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm">OneRoof.co.nz</span>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <span className="text-sm">RealEstate.co.nz</span>
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={onRunAnalysis}
        disabled={isAnalyzing}
        className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
        Refresh Data Collection
      </Button>
    </div>
  );
};

export default DataCollectionTab;
