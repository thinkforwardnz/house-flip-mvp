
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Deal {
  notes?: string;
}

interface PropertyNotesCardProps {
  selectedDeal: Deal;
}

const PropertyNotesCard = ({ selectedDeal }: PropertyNotesCardProps) => {
  if (!selectedDeal.notes) {
    return null;
  }

  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0">
      <CardHeader className="p-6">
        <CardTitle className="text-navy-dark">Analysis Notes</CardTitle>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <p className="text-navy">{selectedDeal.notes}</p>
      </CardContent>
    </Card>
  );
};

export default PropertyNotesCard;
