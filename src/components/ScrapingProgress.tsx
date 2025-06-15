
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Loader2, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { SourceProgress } from '@/hooks/useEnhancedScraping';

interface ScrapingProgressProps {
  isActive: boolean;
  sources: SourceProgress[];
  totalProgress: number;
  onCancel?: () => void;
}

const ScrapingProgress = ({ isActive, sources, totalProgress, onCancel }: ScrapingProgressProps) => {
  const { toast } = useToast();

  if (!isActive && sources.length === 0) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      running: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;
    
    const colors = {
      pending: 'bg-gray-100 text-gray-800',
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  // Show a toast for any failed source
  sources.forEach(source => {
    if (source.status === 'failed' && source.error) {
      toast({
        title: `Scraping Failed: ${source.name}`,
        description: source.error,
        variant: 'destructive',
      });
    }
  });

  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            {isActive && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
            Scraping Progress
          </CardTitle>
          {isActive && onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
          )}
        </div>
        {isActive && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Overall Progress</span>
              <span>{Math.round(totalProgress)}%</span>
            </div>
            <Progress value={totalProgress} className="h-2" />
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {sources.map((source) => (
          <div key={source.name} className="flex items-center justify-between p-3 bg-white rounded-lg border">
            <div className="flex items-center gap-3">
              {getStatusIcon(source.status)}
              <div>
                <div className="font-medium">{source.name}</div>
                {source.status === 'completed' && (
                  <div className="text-sm text-gray-600">
                    {source.scraped || 0} scraped, {source.skipped || 0} skipped
                  </div>
                )}
                {source.status === 'failed' && source.error && (
                  <div className="text-sm text-red-600">{source.error}</div>
                )}
              </div>
            </div>
            {getStatusBadge(source.status)}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ScrapingProgress;
