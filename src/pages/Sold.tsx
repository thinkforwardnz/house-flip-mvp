
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import FinancialSummary from '@/components/FinancialSummary';
import SettlementChecklist from '@/components/SettlementChecklist';
import LessonsLearned from '@/components/LessonsLearned';
import FinalDocuments from '@/components/FinalDocuments';

const Sold = () => {
  const navigate = useNavigate();

  const handleExportReport = () => {
    console.log('Exporting deal report...');
    // Implementation for PDF export would go here
  };

  const handleArchiveDeal = () => {
    console.log('Archiving deal...');
    // Implementation for archiving would go here
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-[Inter]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate('/listed')}
            className="text-gray-600 hover:text-gray-900 border-gray-300"
          >
            ← Back to Listed
          </Button>
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-gray-900">Deal Completed</h1>
            <p className="text-sm text-gray-500 mt-1">1234 Elm Street, Auckland, 1010</p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              onClick={handleExportReport}
              className="border-[#1B5E20] text-[#1B5E20] hover:bg-[#1B5E20] hover:text-white"
            >
              Export Report
            </Button>
            <Button 
              className="bg-[#FF9800] hover:bg-[#FF9800]/90 text-white"
              onClick={handleArchiveDeal}
            >
              Archive Deal
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Financial Summary */}
        <FinancialSummary />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Settlement Checklist */}
          <SettlementChecklist />

          {/* Lessons Learned */}
          <LessonsLearned />
        </div>

        {/* Final Documents */}
        <FinalDocuments />
      </div>
    </div>
  );
};

export default Sold;
