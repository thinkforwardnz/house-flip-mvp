
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Deal } from '@/types/analysis';

interface PropertySelectorMobileProps {
  currentDeal: Deal | undefined;
  getStageColor: (stage: string) => string;
}

const PropertySelectorMobile = ({ currentDeal, getStageColor }: PropertySelectorMobileProps) => {
  const navigate = useNavigate();

  return (
    <div className="block sm:hidden">
      {currentDeal ? (
        <div className="relative">
          {/* Status badge at top right */}
          <div className="absolute right-0 top-0 z-10">
            <span
              className={`${getStageColor(currentDeal.pipeline_stage)} rounded-lg text-xs px-2 py-1 font-semibold inline-block`}
            >
              {currentDeal.pipeline_stage}
            </span>
          </div>
          
          {/* Property details - full width with padding to avoid badge */}
          <div className="pr-20 mb-3">
            <h2 className="text-lg font-bold text-navy-dark break-words leading-tight">
              {currentDeal.address}
            </h2>
            <div className="text-sm text-navy mt-1">
              {currentDeal.suburb}, {currentDeal.city}
            </div>
          </div>
          
          {/* View Analysis Button */}
          <Button
            className="w-full rounded-xl flex items-center justify-center font-semibold bg-blue-primary hover:bg-blue-600 text-white"
            onClick={() => navigate(`/analysis?dealId=${currentDeal.id}`)}
          >
            <Eye className="h-4 w-4 mr-2" />
            View Analysis
          </Button>
        </div>
      ) : (
        <div className="text-center py-4">
          <h2 className="text-lg font-bold text-navy-dark">No property selected</h2>
        </div>
      )}
    </div>
  );
};

export default PropertySelectorMobile;
