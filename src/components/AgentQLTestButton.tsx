
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

const AgentQLTestButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const { toast } = useToast();

  const testAgentQL = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      console.log('Testing AgentQL API key...');
      
      const { data, error } = await supabase.functions.invoke('test-agentql', {
        body: {}
      });

      console.log('AgentQL test response:', { data, error });
      
      if (error) {
        throw error;
      }

      setTestResult(data);
      
      if (data?.success) {
        toast({
          title: "AgentQL Test Successful",
          description: "API key is working correctly",
        });
      } else {
        toast({
          title: "AgentQL Test Failed",
          description: data?.message || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('AgentQL test error:', error);
      setTestResult({ success: false, error: error.message });
      toast({
        title: "Test Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">AgentQL API Test</h3>
        <Button 
          onClick={testAgentQL} 
          disabled={isLoading}
          variant="outline"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Testing...
            </>
          ) : (
            'Test API Key'
          )}
        </Button>
      </div>
      
      {testResult && (
        <div className="mt-4 p-3 rounded-lg border">
          <div className="flex items-center mb-2">
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            )}
            <span className={`font-medium ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
              {testResult.success ? 'Success' : 'Failed'}
            </span>
          </div>
          
          <div className="text-sm text-gray-600">
            <p><strong>Message:</strong> {testResult.message}</p>
            {testResult.connectionTest && (
              <div className="mt-2">
                <p><strong>Connection Test:</strong></p>
                <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto">
                  {JSON.stringify(testResult.connectionTest, null, 2)}
                </pre>
              </div>
            )}
            {testResult.troubleshooting && (
              <div className="mt-2">
                <p><strong>Troubleshooting:</strong></p>
                <ul className="list-disc list-inside text-xs mt-1">
                  {testResult.troubleshooting.possibleCauses?.map((cause: string, index: number) => (
                    <li key={index}>{cause}</li>
                  ))}
                </ul>
              </div>
            )}
            {testResult.error && (
              <div className="mt-2">
                <p><strong>Error:</strong> {testResult.error}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentQLTestButton;
