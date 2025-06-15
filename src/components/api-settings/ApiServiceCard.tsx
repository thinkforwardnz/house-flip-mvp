
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface ApiServiceCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const ApiServiceCard = ({ title, description, children }: ApiServiceCardProps) => {
  // Filter out null/undefined children to correctly place separators
  const validChildren = React.Children.toArray(children).filter(Boolean);
  
  return (
    <Card className="bg-white shadow-lg rounded-2xl border-0 overflow-hidden">
      <CardHeader className="p-6">
        <CardTitle className="text-navy-dark">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          {validChildren.map((child, index) => (
            <React.Fragment key={index}>
              {child}
              {index < validChildren.length - 1 && <Separator className="my-6" />}
            </React.Fragment>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiServiceCard;
