
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';

const EmptyAnalysisState = () => {
  const navigate = useNavigate();

  return (
    <div className="text-center py-12">
      <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-6" />
      <h3 className="text-lg font-semibold text-navy-dark mb-2">No Properties in Analysis</h3>
      <p className="text-navy mb-6">Import properties from the Find stage to start analysis.</p>
      <Button onClick={() => navigate('/find')} className="bg-blue-primary hover:bg-blue-600 text-white rounded-xl">
        Find Properties
      </Button>
    </div>
  );
};

export default EmptyAnalysisState;
