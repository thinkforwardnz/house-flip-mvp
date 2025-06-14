import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { MapPin, RefreshCw, Download, CheckCircle, AlertTriangle } from 'lucide-react';
import type { Deal } from '@/types/analysis';

interface PropertyHeaderProps {
  deal: Deal;
  isAnalyzing: boolean;
  analysisStep: string;
  progress: number;
  completed: string[];
  pending: string[];
  onRunAnalysis: () => void;
}

const PropertyHeader = ({ 
  deal, 
  isAnalyzing, 
  analysisStep, 
  progress, 
  completed, 
  pending, 
  onRunAnalysis 
}: PropertyHeaderProps) => {
  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0">
      <CardContent className="p-3 xs:p-4 md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between mb-4">
          <div className="mb-2 md:mb-0 min-w-0">
            <h1 className="text-lg xs:text-xl md:text-2xl font-bold text-navy-dark mb-1 truncate">{deal.address}</h1>
            <div className="flex items-center text-navy text-xs xs:text-sm md:text-base mb-1">
              <MapPin className="h-4 w-4 mr-1" />
              {deal.suburb}, {deal.city}
            </div>
            <Badge className={`${
              deal.current_risk === 'low' ? 'bg-green-100 text-green-800' :
              deal.current_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            } rounded-lg text-xs xs:text-sm`}>
              {deal.current_risk} Risk
            </Badge>
          </div>
          <div className="flex flex-col gap-2 w-full sm:flex-row sm:w-auto">
            <Button 
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl w-full sm:w-auto"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <Button variant="outline" className="rounded-xl w-full sm:w-auto">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {isAnalyzing && (
          <div className="bg-blue-50 p-3 xs:p-3 md:p-4 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-900 truncate">{analysisStep}</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}

        <div className="bg-gray-50 p-3 xs:p-3 md:p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-navy-dark text-xs xs:text-sm md:text-base">Analysis Progress</h3>
            <span className="text-xs xs:text-sm font-medium text-navy-dark">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2 md:h-3 mb-2 md:mb-3" />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 md:gap-4 text-xs xs:text-sm">
            <div>
              <p className="font-medium text-green-600 mb-1">Completed ({completed.length})</p>
              <ul className="space-y-1">
                {completed.map((item, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-orange-600 mb-1">Pending ({pending.length})</p>
              <ul className="space-y-1">
                {pending.map((item, index) => (
                  <li key={index} className="flex items-center text-orange-700">
                    <AlertTriangle className="h-3 w-3 mr-2" />
                    <span className="truncate">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyHeader;
