
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface Offer {
  id: string;
  buyerName: string;
  price: number;
  conditions: string[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
  date: string;
  expiry: string;
}

const BuyerOffersTable = () => {
  const [offers, setOffers] = useState<Offer[]>([
    {
      id: '1',
      buyerName: 'John & Mary Smith',
      price: 645000,
      conditions: ['Finance', 'LIM', 'Builder\'s Report'],
      status: 'pending',
      date: '2024-02-15',
      expiry: '2024-02-20'
    },
    {
      id: '2',
      buyerName: 'David Chen',
      price: 630000,
      conditions: ['Finance'],
      status: 'declined',
      date: '2024-02-12',
      expiry: '2024-02-17'
    },
    {
      id: '3',
      buyerName: 'Sarah Williams',
      price: 655000,
      conditions: ['Finance', 'Builder\'s Report'],
      status: 'pending',
      date: '2024-02-16',
      expiry: '2024-02-21'
    }
  ]);

  const handleOfferAction = (offerId: string, action: 'accept' | 'decline') => {
    setOffers(offers.map(offer => 
      offer.id === offerId 
        ? { ...offer, status: action === 'accept' ? 'accepted' : 'declined' }
        : offer
    ));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-[#FF9800]/10 text-[#FF9800] border-[#FF9800]/20">Pending</Badge>;
      case 'accepted':
        return <Badge className="bg-[#388E3C]/10 text-[#388E3C] border-[#388E3C]/20">Accepted</Badge>;
      case 'declined':
        return <Badge className="bg-[#D32F2F]/10 text-[#D32F2F] border-[#D32F2F]/20">Declined</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>;
      default:
        return null;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(price);
  };

  return (
    <Card className="bg-white border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900">Buyer Offers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium text-gray-700">Buyer</TableHead>
                <TableHead className="font-medium text-gray-700">Offer Price</TableHead>
                <TableHead className="font-medium text-gray-700">Conditions</TableHead>
                <TableHead className="font-medium text-gray-700">Date</TableHead>
                <TableHead className="font-medium text-gray-700">Expiry</TableHead>
                <TableHead className="font-medium text-gray-700">Status</TableHead>
                <TableHead className="font-medium text-gray-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.buyerName}</TableCell>
                  <TableCell className="font-semibold text-gray-900">
                    {formatPrice(offer.price)}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {offer.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-600">{offer.date}</TableCell>
                  <TableCell className="text-gray-600">{offer.expiry}</TableCell>
                  <TableCell>{getStatusBadge(offer.status)}</TableCell>
                  <TableCell>
                    {offer.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-[#388E3C] hover:bg-[#388E3C]/90 text-white"
                          onClick={() => handleOfferAction(offer.id, 'accept')}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Accept
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white"
                          onClick={() => handleOfferAction(offer.id, 'decline')}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Decline
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Cards for smaller screens */}
        <div className="md:hidden space-y-4 mt-4">
          {offers.map((offer) => (
            <Card key={offer.id} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-medium text-gray-900">{offer.buyerName}</h4>
                    <p className="text-lg font-semibold text-gray-900">{formatPrice(offer.price)}</p>
                  </div>
                  {getStatusBadge(offer.status)}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-500">Conditions: </span>
                    {offer.conditions.join(', ')}
                  </div>
                  <div>
                    <span className="text-gray-500">Date: </span>
                    {offer.date}
                  </div>
                  <div>
                    <span className="text-gray-500">Expiry: </span>
                    {offer.expiry}
                  </div>
                </div>

                {offer.status === 'pending' && (
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      className="bg-[#388E3C] hover:bg-[#388E3C]/90 text-white flex-1"
                      onClick={() => handleOfferAction(offer.id, 'accept')}
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[#D32F2F] text-[#D32F2F] hover:bg-[#D32F2F] hover:text-white flex-1"
                      onClick={() => handleOfferAction(offer.id, 'decline')}
                    >
                      Decline
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default BuyerOffersTable;
