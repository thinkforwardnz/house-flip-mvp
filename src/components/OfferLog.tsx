
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Clock, DollarSign } from 'lucide-react';

interface Offer {
  id: string;
  date: string;
  price: number;
  deposit: number;
  conditions: string[];
  status: 'pending' | 'accepted' | 'rejected' | 'expired' | 'withdrawn';
  response: string;
}

const OfferLog = () => {
  const offers: Offer[] = [
    {
      id: '1',
      date: '2024-02-10',
      price: 620000,
      deposit: 62000,
      conditions: ['Finance 21 days', 'LIM 10 days'],
      status: 'rejected',
      response: 'Price too low'
    },
    {
      id: '2', 
      date: '2024-02-12',
      price: 635000,
      deposit: 63500,
      conditions: ['Finance 14 days', 'Builders report 7 days'],
      status: 'pending',
      response: 'Awaiting vendor response'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20';
      case 'accepted': return 'bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20';
      case 'rejected': return 'bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20';
      case 'expired': return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'withdrawn': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="p-6">
      <Card className="bg-white border border-gray-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="h-5 w-5 text-[#1B5E20]" />
            Offer History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {offers.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No offers yet</h3>
              <p className="text-gray-500">Your offers for this property will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-600">Date</TableHead>
                    <TableHead className="text-gray-600">Offer Price</TableHead>
                    <TableHead className="text-gray-600">Deposit</TableHead>
                    <TableHead className="text-gray-600">Conditions</TableHead>
                    <TableHead className="text-gray-600">Status</TableHead>
                    <TableHead className="text-gray-600">Response</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {offers.map((offer) => (
                    <TableRow key={offer.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium text-gray-900">
                        {new Date(offer.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-semibold text-[#1B5E20]">
                        ${offer.price.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-gray-900">
                        ${offer.deposit.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {offer.conditions.map((condition, index) => (
                            <Badge 
                              key={index} 
                              variant="outline" 
                              className="text-xs border-gray-300 text-gray-600"
                            >
                              {condition}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`border ${getStatusColor(offer.status)}`}>
                          {offer.status.charAt(0).toUpperCase() + offer.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 max-w-xs truncate">
                        {offer.response}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default OfferLog;
