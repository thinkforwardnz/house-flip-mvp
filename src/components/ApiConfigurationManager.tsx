
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
    try {
      // NOTE: This assumes `get-scraper-config` is updated to return all configs.
      const { data, error } = await supabase.functions.invoke('get-scraper-config');
      if (error) throw error;
      
      const loadedConfigs = { ...data };
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
        description: "Could not fetch API configurations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, allConfigKeys]);

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

    // Re-use existing test logic for trademe scraper
    if (id === 'trademe_endpoint') {
      try {
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
      } catch (error) {
        console.error('Endpoint test failed:', error);
        setTestStatuses(prev => ({ ...prev, [id]: 'failed' }));
        toast({
          title: "Endpoint Test Failed",
          description: error instanceof Error ? error.message : 'Unknown error occurred',
          variant: "destructive",
        });
      }
    } else {
      // Placeholder for other API tests
      // In a real implementation, you would invoke a Supabase function here.
      setTimeout(() => {
        toast({
            title: "Test Not Implemented",
            description: `Testing for ${id} is not yet configured.`,
        });
        setTestStatuses(prev => ({ ...prev, [id]: 'untested' }));
      }, 1000);
    }
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const changedConfigs: Record<string, string> = {};
      allConfigKeys.forEach(key => {
        if (configs[key] !== initialConfigs[key]) {
          changedConfigs[key] = configs[key];
        }
      });
      
      if (Object.keys(changedConfigs).length === 0) {
        toast({ title: 'No changes to save.' });
        return;
      }

      // NOTE: This assumes `update-scraper-config` is updated to accept multiple keys.
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
