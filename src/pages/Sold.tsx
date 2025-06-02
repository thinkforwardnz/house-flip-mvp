
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import FinancialSummary from '@/components/FinancialSummary';
import SettlementChecklist from '@/components/SettlementChecklist';
import LessonsLearned from '@/components/LessonsLearned';
import FinalDocuments from '@/components/FinalDocuments';

const Sold = () => {
  const navigate = useNavigate();

  const handleExportReport = () => {
    console.log('Exporting deal report...');
  };

  const handleArchiveDeal = () => {
    console.log('Archiving deal...');
    navigate('/');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Deal Completed</h1>
          <p className="text-blue-100 text-lg">1234 Elm Street, Auckland, 1010</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={handleExportReport}
            className="rounded-xl bg-white border-white text-navy-dark hover:bg-gray-50"
          >
            Export Report
          </Button>
          <Button 
            className="bg-orange-accent hover:bg-orange-600 text-white rounded-xl"
            onClick={handleArchiveDeal}
          >
            Archive Deal
          </Button>
        </div>
      </div>

      {/* Financial Summary */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <FinancialSummary />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settlement Checklist */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <SettlementChecklist />
          </CardContent>
        </Card>

        {/* Lessons Learned */}
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-6">
            <LessonsLearned />
          </CardContent>
        </Card>
      </div>

      {/* Final Documents */}
      <Card className="bg-white shadow-lg rounded-2xl border-0">
        <CardContent className="p-6">
          <FinalDocuments />
        </CardContent>
      </Card>
    </div>
  );
};

export default Sold;
