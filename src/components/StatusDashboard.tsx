
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';

const StatusDashboard = () => {
  const stats = {
    totalItems: 6,
    completed: 1,
    inProgress: 3,
    overdue: 1,
    pending: 1
  };

  const completionRate = (stats.completed / stats.totalItems) * 100;
  const dueDiligenceExpiry = '2024-02-28';
  const daysRemaining = 12;

  return (
    <div className="mb-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
            {/* Overall Progress */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#1B5E20]/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-[#1B5E20]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Due Diligence Progress</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Completion</span>
                      <span className="text-gray-900 font-medium">{completionRate.toFixed(0)}%</span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="md:col-span-3">
              <h4 className="font-medium text-gray-800 mb-3">Status Breakdown</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-[#388E3C]" />
                  <span className="text-sm text-gray-600">Complete:</span>
                  <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20 text-xs">
                    {stats.completed}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-[#FF9800]" />
                  <span className="text-sm text-gray-600">In Progress:</span>
                  <Badge className="bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20 text-xs">
                    {stats.inProgress}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-[#D32F2F]" />
                  <span className="text-sm text-gray-600">Overdue:</span>
                  <Badge className="bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20 text-xs">
                    {stats.overdue}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">Pending:</span>
                  <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                    {stats.pending}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Due Diligence Expiry */}
            <div>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-[#FF9800]/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-[#FF9800]" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-800 mb-1">DD Expiry</h4>
                  <p className="text-sm text-gray-600 mb-1">{dueDiligenceExpiry}</p>
                  <Badge className={`text-xs px-2 py-1 ${
                    daysRemaining <= 3 ? 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20' :
                    daysRemaining <= 7 ? 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20' :
                    'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20'
                  }`}>
                    {daysRemaining} days left
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusDashboard;
