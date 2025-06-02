
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, FileText, Eye } from 'lucide-react';

interface ReviewItem {
  id: string;
  document: string;
  type: 'risk' | 'missing' | 'good';
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  recommendation: string;
}

const AIReviewSummary = () => {
  const reviewItems: ReviewItem[] = [
    {
      id: '1',
      document: 'LIM Report',
      type: 'risk',
      title: 'Flood Risk Identified',
      description: 'Property is in a designated flood zone according to council records.',
      severity: 'high',
      recommendation: 'Consider additional flood insurance and review drainage systems.'
    },
    {
      id: '2',
      document: 'Contractor Quotes',
      type: 'risk',
      title: 'Budget Variance Detected',
      description: 'Kitchen renovation quotes exceed budget by 23%.',
      severity: 'medium',
      recommendation: 'Negotiate with contractors or adjust scope of work.'
    },
    {
      id: '3',
      document: 'Missing Documents',
      type: 'missing',
      title: 'Insurance Quote Required',
      description: 'Property insurance quote not yet uploaded.',
      severity: 'high',
      recommendation: 'Obtain insurance quote before due diligence expiry.'
    },
    {
      id: '4',
      document: 'LIM Report',
      type: 'good',
      title: 'Clean Title Confirmed',
      description: 'No liens, encumbrances, or title issues identified.',
      severity: 'low',
      recommendation: 'No action required - proceed as planned.'
    },
    {
      id: '5',
      document: 'Builder\'s Report',
      type: 'missing',
      title: 'Structural Report Pending',
      description: 'Builder\'s inspection report not yet received.',
      severity: 'high',
      recommendation: 'Follow up with building inspector for completion date.'
    }
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-[#D32F2F]" />;
      case 'missing':
        return <FileText className="h-5 w-5 text-[#FF9800]" />;
      case 'good':
        return <CheckCircle className="h-5 w-5 text-[#388E3C]" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'risk':
        return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      case 'missing':
        return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'good':
        return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      case 'medium':
        return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'low':
        return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const riskCount = reviewItems.filter(item => item.type === 'risk').length;
  const missingCount = reviewItems.filter(item => item.type === 'missing').length;
  const goodCount = reviewItems.filter(item => item.type === 'good').length;

  return (
    <div className="p-6 space-y-6">
      {/* AI Review Overview */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">AI Document Review</h3>
            <Badge className="bg-blue-100 text-blue-800 border-blue-200">
              Last Updated: 2 hours ago
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-[#D32F2F]" />
              <div>
                <p className="text-sm text-gray-600">Risks Identified</p>
                <p className="text-xl font-semibold text-[#D32F2F]">{riskCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-[#FF9800]" />
              <div>
                <p className="text-sm text-gray-600">Missing Items</p>
                <p className="text-xl font-semibold text-[#FF9800]">{missingCount}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-[#388E3C]" />
              <div>
                <p className="text-sm text-gray-600">Items Clear</p>
                <p className="text-xl font-semibold text-[#388E3C]">{goodCount}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Review Items */}
      <div className="space-y-4">
        {reviewItems.map((item) => (
          <Card key={item.id} className="bg-white border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 mt-0.5">
                  {getTypeIcon(item.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                        <Badge className={`text-xs px-2 py-1 border ${getTypeColor(item.type)}`}>
                          {item.type}
                        </Badge>
                        <Badge className={`text-xs px-2 py-1 border ${getSeverityColor(item.severity)}`}>
                          {item.severity} priority
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <strong>Document:</strong> {item.document}
                      </p>
                      <p className="text-sm text-gray-700 mb-3">{item.description}</p>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          <strong>AI Recommendation:</strong> {item.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-600">
                      <Eye className="h-4 w-4 mr-1" />
                      View Document
                    </Button>
                    <Button size="sm" className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
                      Take Action
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Re-scan Button */}
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6 text-center">
          <h4 className="font-medium text-gray-900 mb-2">Upload new documents?</h4>
          <p className="text-sm text-gray-600 mb-4">
            AI will automatically scan new uploads for risks and missing information.
          </p>
          <Button className="bg-[#1B5E20] hover:bg-[#1B5E20]/90 text-white">
            Re-scan All Documents
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIReviewSummary;
