
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Settings, TestTube, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ScraperEndpointSettings = () => {
  const [currentEndpoint, setCurrentEndpoint] = useState('');
  const [newEndpoint, setNewEndpoint] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'failed' | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentEndpoint();
  }, []);

  const loadCurrentEndpoint = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-scraper-config');
      if (error) throw error;
      
      const endpoint = data?.endpoint || 'https://e104-222-154-21-216.ngrok-free.app';
      setCurrentEndpoint(endpoint);
      setNewEndpoint(endpoint);
    } catch (error) {
      console.error('Failed to load current endpoint:', error);
      // Set default if loading fails
      const defaultEndpoint = 'https://e104-222-154-21-216.ngrok-free.app';
      setCurrentEndpoint(defaultEndpoint);
      setNewEndpoint(defaultEndpoint);
    }
  };

  const testEndpoint = async (endpoint: string) => {
    setIsTesting(true);
    setTestResult(null);
    
    try {
      // Test the endpoint by making a simple request
      const testUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
      const response = await fetch(`${endpoint}/scrape-search-results`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: testUrl,
          backend: 'playwright'
        }),
      });

      if (response.ok) {
        setTestResult('success');
        toast({
          title: "Endpoint Test Successful",
          description: "The scraper endpoint is working correctly.",
        });
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Endpoint test failed:', error);
      setTestResult('failed');
      toast({
        title: "Endpoint Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  const updateEndpoint = async () => {
    if (!newEndpoint.trim()) {
      toast({
        title: "Invalid Endpoint",
        description: "Please enter a valid endpoint URL.",
        variant: "destructive",
      });
      return;
    }

    // Validate URL format
    try {
      new URL(newEndpoint);
    } catch {
      toast({
        title: "Invalid URL Format",
        description: "Please enter a valid URL (e.g., https://example.com).",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const { error } = await supabase.functions.invoke('update-scraper-config', {
        body: { endpoint: newEndpoint.trim() }
      });

      if (error) throw error;

      setCurrentEndpoint(newEndpoint);
      setTestResult(null);
      
      toast({
        title: "Endpoint Updated",
        description: "Scraper endpoint has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update endpoint:', error);
      toast({
        title: "Update Failed",
        description: error instanceof Error ? error.message : 'Failed to update endpoint',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTestStatusIcon = () => {
    if (isTesting) return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
    if (testResult === 'success') return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (testResult === 'failed') return <XCircle className="h-4 w-4 text-red-600" />;
    return <TestTube className="h-4 w-4 text-gray-400" />;
  };

  const isEndpointChanged = currentEndpoint !== newEndpoint.trim();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Scraper Endpoint Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="current-endpoint">Current Endpoint</Label>
          <div className="flex items-center gap-2">
            <Input
              id="current-endpoint"
              value={currentEndpoint}
              readOnly
              className="bg-gray-50"
            />
            <Badge variant="secondary">Active</Badge>
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="new-endpoint">Update Endpoint</Label>
          <div className="flex gap-2">
            <Input
              id="new-endpoint"
              placeholder="Enter new scraper endpoint URL..."
              value={newEndpoint}
              onChange={(e) => setNewEndpoint(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={() => testEndpoint(newEndpoint)}
              disabled={!newEndpoint.trim() || isTesting}
              variant="outline"
              className="flex items-center gap-2"
            >
              {getTestStatusIcon()}
              Test
            </Button>
          </div>
          
          {testResult && (
            <div className={`text-sm p-2 rounded ${
              testResult === 'success' 
                ? 'bg-green-50 text-green-700' 
                : 'bg-red-50 text-red-700'
            }`}>
              {testResult === 'success' 
                ? '✓ Endpoint is working correctly' 
                : '✗ Endpoint test failed - check URL and try again'}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-600">
            Update the endpoint when your ngrok URL changes
          </div>
          <Button
            onClick={updateEndpoint}
            disabled={!isEndpointChanged || isLoading}
            className="flex items-center gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Endpoint
          </Button>
        </div>

        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <strong>Note:</strong> This endpoint is used for TradeMe property scraping. 
          Make sure your ngrok tunnel is running and accessible before updating.
        </div>
      </CardContent>
    </Card>
  );
};

export default ScraperEndpointSettings;
