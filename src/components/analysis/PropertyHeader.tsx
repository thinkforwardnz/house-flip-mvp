
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
    <Card className="bg-white shadow-lg rounded-2xl border-0 w-full">
      <CardContent className="p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:gap-3">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-lg font-bold text-navy-dark mb-1 break-words">{deal.address}</h1>
              <div className="flex items-center text-navy text-xs sm:text-sm mb-1">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {deal.suburb}, {deal.city}
              </div>
              <Badge className={`${
                deal.current_risk === 'low' ? 'bg-green-100 text-green-800' :
                deal.current_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              } rounded-lg text-xs`}>
                {deal.current_risk} Risk
              </Badge>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              <Button 
                onClick={onRunAnalysis}
                disabled={isAnalyzing}
                className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl text-xs sm:text-sm"
                size="sm"
              >
                <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
                {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
              </Button>
              <Button variant="outline" className="rounded-xl text-xs sm:text-sm" size="sm">
                <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {isAnalyzing && (
            <div className="bg-blue-50 p-2 sm:p-3 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4 animate-spin text-blue-600" />
                <span className="text-xs font-medium text-blue-900 break-words">{analysisStep}</span>
              </div>
              <Progress value={75} className="h-1 sm:h-2" />
            </div>
          )}

          <div className="bg-gray-50 p-2 sm:p-3 rounded-xl">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <h3 className="font-semibold text-navy-dark text-xs sm:text-sm">Analysis Progress</h3>
              <span className="text-xs font-medium text-navy-dark">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1 sm:h-2 mb-2" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div>
                <p className="font-medium text-green-600 mb-1">Completed ({completed.length})</p>
                <ul className="space-y-0.5">
                  {completed.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-center text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate text-xs">{item}</span>
                    </li>
                  ))}
                  {completed.length > 3 && (
                    <li className="text-green-600 text-xs">+{completed.length - 3} more</li>
                  )}
                </ul>
              </div>
              <div>
                <p className="font-medium text-orange-600 mb-1">Pending ({pending.length})</p>
                <ul className="space-y-0.5">
                  {pending.slice(0, 3).map((item, index) => (
                    <li key={index} className="flex items-center text-orange-700">
                      <AlertTriangle className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate text-xs">{item}</span>
                    </li>
                  ))}
                  {pending.length > 3 && (
                    <li className="text-orange-600 text-xs">+{pending.length - 3} more</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyHeader;
