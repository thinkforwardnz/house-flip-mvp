
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import ApiServiceCard from './api-settings/ApiServiceCard';
import ApiConfigInput, { TestStatus } from './api-settings/ApiConfigInput';
import { apiConfigStructure } from './api-settings/apiConfigStructure';

const ApiConfigurationManager = () => {
  const [configs, setConfigs] = useState<Record<string, string>>({});
  const [initialConfigs, setInitialConfigs] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const { toast } = useToast();

  const allConfigKeys = Object.values(apiConfigStructure).flat().map(c => c.id);

  const loadConfigs = useCallback(async () => {
    setIsLoading(true);
    console.log('Loading API configurations...');
    
    try {
      const { data, error } = await supabase.functions.invoke('get-scraper-config');
      console.log('API config response:', { data, error });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      const loadedConfigs = { ...data };
      console.log('Loaded configs:', loadedConfigs);
      
      setConfigs(loadedConfigs);
      setInitialConfigs(loadedConfigs);
      
      // Initialize test statuses
      const initialStatuses: Record<string, TestStatus> = {};
      allConfigKeys.forEach(key => {
        initialStatuses[key] = 'untested';
      });
      setTestStatuses(initialStatuses);

    } catch (error) {
      console.error('Failed to load API configurations:', error);
      toast({
        title: "Failed to load settings",
        description: `Could not fetch API configurations: ${error.message || 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadConfigs();
  }, [loadConfigs]);

  const handleConfigChange = (id: string, value: string) => {
    setConfigs(prev => ({ ...prev, [id]: value }));
    // Reset test status on change
    setTestStatuses(prev => ({ ...prev, [id]: 'untested' }));
  };

  const handleTest = async (id: string, value: string) => {
    if (!value) {
        toast({ title: 'Missing Value', description: 'Please enter a value to test.', variant: 'destructive' });
        return;
    }
    setTestStatuses(prev => ({ ...prev, [id]: 'testing' }));

    try {
      if (id === 'trademe_endpoint') {
        const testUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
        const response = await fetch(`${value}/scrape-search-results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: testUrl, backend: 'playwright' }),
        });

        if (response.ok) {
          setTestStatuses(prev => ({ ...prev, [id]: 'success' }));
          toast({ title: "Test Successful", description: "The scraper endpoint is working correctly." });
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } else if (id === 'openai_api_key') {
        // Test OpenAI API key
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: { 'Authorization': `Bearer ${value}` }
        });
        
        if (response.ok) {
          setTestStatuses(prev => ({ ...prev, [id]: 'success' }));
          toast({ title: "Test Successful", description: "OpenAI API key is valid." });
        } else {
          throw new Error('Invalid OpenAI API key');
        }
      } else if (id === 'google_maps_api_key') {
        // Test Google Maps API key
        const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=Auckland&key=${value}`);
        const data = await response.json();
        
        if (data.status === 'OK') {
          setTestStatuses(prev => ({ ...prev, [id]: 'success' }));
          toast({ title: "Test Successful", description: "Google Maps API key is valid." });
        } else {
          throw new Error(data.error_message || 'Invalid Google Maps API key');
        }
      } else {
        // For other API keys, show a message that testing is not implemented
        setTimeout(() => {
          toast({
            title: "Test Not Implemented",
            description: `Testing for ${id} is not yet configured.`,
          });
          setTestStatuses(prev => ({ ...prev, [id]: 'untested' }));
        }, 1000);
      }
    } catch (error) {
      console.error(`${id} test failed:`, error);
      setTestStatuses(prev => ({ ...prev, [id]: 'failed' }));
      toast({
        title: "Test Failed",
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: "destructive",
      });
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const changedConfigs: Record<string, string> = {};
      allConfigKeys.forEach(key => {
        if (configs[key] !== initialConfigs[key]) {
          changedConfigs[key] = configs[key] || '';
        }
      });
      
      if (Object.keys(changedConfigs).length === 0) {
        toast({ title: 'No changes to save.' });
        return;
      }

      const { error } = await supabase.functions.invoke('update-scraper-config', {
        body: changedConfigs
      });

      if (error) throw error;
      
      setInitialConfigs(configs);
      toast({
        title: "Settings Saved",
        description: "Your API configurations have been updated.",
      });
    } catch (error) {
      console.error('Failed to save API configurations:', error);
      toast({
        title: "Save Failed",
        description: "Could not save your settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isChanged = JSON.stringify(configs) !== JSON.stringify(initialConfigs);

  return (
    <div className="space-y-8">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> API keys are securely stored as Supabase secrets. Values shown here are masked for security. 
          To update API keys, use the Supabase dashboard or contact your administrator.
        </p>
      </div>
      {Object.entries(apiConfigStructure).map(([groupTitle, groupConfigs]) => (
        <ApiServiceCard key={groupTitle} title={groupTitle}>
          {groupConfigs.map(config => (
            <ApiConfigInput
              key={config.id}
              id={config.id}
              label={config.label}
              value={configs[config.id] || ''}
              onChange={(value) => handleConfigChange(config.id, value)}
              isSecret={config.type === 'key'}
              placeholder={config.placeholder}
              helpText={config.help}
              link={config.link}
              onTest={handleTest}
              testStatus={testStatuses[config.id] || 'untested'}
            />
          ))}
        </ApiServiceCard>
      ))}
      <div className="flex justify-end mt-8 border-t pt-6">
        <Button onClick={handleSave} disabled={!isChanged || isSaving || isLoading} size="lg">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default ApiConfigurationManager;
