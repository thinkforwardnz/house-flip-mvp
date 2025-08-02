import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useDeals } from '@/hooks/useDeals';
import { useArchiveDeal } from '@/hooks/mutations/useArchiveDeal';
import { Archive, Search, RotateCcw, FileText } from 'lucide-react';
import { formatCurrency } from '@/utils/formatCurrency';
import type { Deal } from '@/types/analysis';

const ArchivedProperties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { deals, isLoading } = useDeals(true);
  const { unarchiveDeal, isUnarchiving } = useArchiveDeal();

  // Filter for archived deals
  const archivedDeals = deals.filter(deal => deal.archived);
  
  // Filter by search term
  const filteredDeals = archivedDeals.filter(deal =>
    deal.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    deal.suburb?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUnarchive = (dealId: string) => {
    unarchiveDeal(dealId);
  };

  const handleExport = (deal: Deal) => {
    console.log('Exporting archived deal:', deal.address);
    // TODO: Implement export functionality
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Archive className="h-5 w-5 text-slate-600" />
          <h2 className="text-xl font-semibold text-slate-700">Archived Properties</h2>
          <Badge variant="secondary" className="ml-2">
            {archivedDeals.length}
          </Badge>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search archived properties..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Archived Properties Grid */}
      {filteredDeals.length === 0 ? (
        <Card className="bg-white shadow-lg rounded-2xl border-0">
          <CardContent className="p-12 text-center">
            <Archive className="h-16 w-16 text-gray-300 mx-auto mb-6" />
            <h3 className="text-lg font-semibold text-slate-700 mb-2">
              {archivedDeals.length === 0 ? 'No Archived Properties' : 'No Properties Found'}
            </h3>
            <p className="text-slate-600">
              {archivedDeals.length === 0 
                ? 'You haven\'t archived any properties yet.'
                : 'No properties match your search criteria.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDeals.map((deal) => (
            <Card key={deal.id} className="bg-white shadow-lg rounded-2xl border-0 hover:shadow-xl transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg font-semibold text-slate-700 line-clamp-2">
                      {deal.address}
                    </CardTitle>
                    {deal.suburb && (
                      <p className="text-sm text-slate-500 mt-1">{deal.suburb}</p>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Archived
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Financial Summary */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">Purchase Price</p>
                    <p className="font-medium text-slate-700">
                      {deal.purchase_price ? formatCurrency(deal.purchase_price) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Sale Price</p>
                    <p className="font-medium text-slate-700">
                      {deal.target_sale_price ? formatCurrency(deal.target_sale_price) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Profit</p>
                    <p className="font-medium text-green-600">
                      {deal.current_profit ? formatCurrency(deal.current_profit) : formatCurrency(0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Archived</p>
                    <p className="font-medium text-slate-700">
                      {deal.archived_at 
                        ? new Date(deal.archived_at).toLocaleDateString()
                        : 'N/A'
                      }
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUnarchive(deal.id)}
                    disabled={isUnarchiving}
                    className="flex-1"
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Restore
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(deal)}
                    className="flex-1"
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ArchivedProperties;