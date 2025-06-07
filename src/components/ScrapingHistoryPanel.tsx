
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, History, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useScrapingHistory } from '@/hooks/useScrapingHistory';
import { formatDistanceToNow } from 'date-fns';

const ScrapingHistoryPanel = () => {
  const { history, isLoading } = useScrapingHistory();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Scraping History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">Loading history...</div>
        </CardContent>
      </Card>
    );
  }

  if (history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Scraping History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-gray-500">
            No scraping history yet. Click "Refresh Feed" to start scraping properties.
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'running':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      running: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    } as const;

    return (
      <Badge className={colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Scraping History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {history.slice(0, 5).map((record) => (
            <Collapsible key={record.id}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(record.status)}
                    <div className="text-left">
                      <div className="font-medium">
                        {record.sources_requested.join(', ')} Scrape
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDistanceToNow(new Date(record.started_at), { addSuffix: true })}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(record.status)}
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="mt-2 p-3 bg-gray-50 rounded-lg border space-y-2">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Total Scraped:</span> {record.total_scraped}
                    </div>
                    <div>
                      <span className="font-medium">Total Skipped:</span> {record.total_skipped}
                    </div>
                  </div>
                  
                  {record.results && Object.keys(record.results).length > 0 && (
                    <div className="space-y-2">
                      <div className="font-medium text-sm">Results by Source:</div>
                      {Object.entries(record.results).map(([source, result]: [string, any]) => {
                        // Add null check for result
                        if (!result || typeof result !== 'object') {
                          return (
                            <div key={source} className="text-sm bg-white p-2 rounded border">
                              <div className="font-medium">{source}</div>
                              <div className="text-gray-600">No data available</div>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={source} className="text-sm bg-white p-2 rounded border">
                            <div className="font-medium">{source}</div>
                            <div className="text-gray-600">
                              Scraped: {result.scraped || 0}, Skipped: {result.skipped || 0}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {record.errors && record.errors.length > 0 && (
                    <div className="space-y-1">
                      <div className="font-medium text-sm text-red-600">Errors:</div>
                      {record.errors.map((error, index) => (
                        <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                          {error}
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {record.completed_at && (
                    <div className="text-xs text-gray-500 pt-2 border-t">
                      Completed: {new Date(record.completed_at).toLocaleString()}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingHistoryPanel;
