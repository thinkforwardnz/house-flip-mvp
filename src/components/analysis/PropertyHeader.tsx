
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
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-navy-dark mb-2">{deal.address}</h1>
            <div className="flex items-center text-navy mb-2">
              <MapPin className="h-4 w-4 mr-1" />
              {deal.suburb}, {deal.city}
            </div>
            <Badge className={`${
              deal.current_risk === 'low' ? 'bg-green-100 text-green-800' :
              deal.current_risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            } rounded-lg`}>
              {deal.current_risk} Risk
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onRunAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'Run Analysis'}
            </Button>
            <Button variant="outline" className="rounded-xl">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Show analysis progress */}
        {isAnalyzing && (
          <div className="bg-blue-50 p-4 rounded-xl mb-4">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
              <span className="text-sm font-medium text-blue-900">{analysisStep}</span>
            </div>
            <Progress value={75} className="h-2" />
          </div>
        )}

        {/* Progress Overview */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-navy-dark">Analysis Progress</h3>
            <span className="text-sm font-medium text-navy-dark">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-3 mb-3" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-medium text-green-600 mb-1">Completed ({completed.length})</p>
              <ul className="space-y-1">
                {completed.map((item, index) => (
                  <li key={index} className="flex items-center text-green-700">
                    <CheckCircle className="h-3 w-3 mr-2" />
                    {item}
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
                    {item}
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
