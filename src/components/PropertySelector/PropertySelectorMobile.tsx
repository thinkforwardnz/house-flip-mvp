
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
    <div className="block sm:hidden relative">
      {/* Status badge at top right */}
      {currentDeal && (
        <span
          className={`absolute right-0 top-0 m-2 z-10 ${getStageColor(currentDeal.pipeline_stage)} rounded-lg text-xs px-2 py-1 font-semibold`}
        >
          {currentDeal.pipeline_stage}
        </span>
      )}
      {/* Address/Title */}
      <div className="mb-2 mt-6 pr-8">
        <h2 className="text-lg font-bold text-navy-dark break-words">{currentDeal?.address || "No property selected"}</h2>
        {currentDeal && (
          <div className="text-sm text-navy">
            {currentDeal.suburb}, {currentDeal.city}
          </div>
        )}
      </div>
      {/* View Analysis Button - if in detail page */}
      {currentDeal && (
        <Button
          className="w-full mb-2 rounded-xl flex items-center justify-center font-semibold"
          variant="outline"
          onClick={() => navigate(`/analysis?dealId=${currentDeal.id}`)}
        >
          <Eye className="h-4 w-4 mr-2" />
          View Analysis
        </Button>
      )}
    </div>
  );
};

export default PropertySelectorMobile;
