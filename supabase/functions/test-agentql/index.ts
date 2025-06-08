
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { corsHeaders } from '../shared/cors.ts';
import { AgentQLPropertyClient } from '../shared/agentql-property-client.ts';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Starting AgentQL API test...');

    // Check if API key is configured
    const apiKey = Deno.env.get('AGENTQL_API_KEY');
    console.log('API Key check:', {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      prefix: apiKey?.substring(0, 8) + '...' || 'N/A'
    });

    if (!apiKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'AGENTQL_API_KEY not configured',
        message: 'Please add your AgentQL API key to Supabase Edge Function secrets',
        steps: [
          '1. Go to Supabase Dashboard > Edge Functions > Settings',
          '2. Add a new secret: AGENTQL_API_KEY',
          '3. Enter your AgentQL API key value'
        ]
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test client initialization
    let client;
    try {
      client = new AgentQLPropertyClient();
      console.log('Client initialized successfully');
    } catch (error) {
      console.error('Client initialization failed:', error);
      return new Response(JSON.stringify({
        success: false,
        error: 'Client initialization failed',
        message: error.message,
        details: 'Failed to create AgentQL client instance'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Test API connection
    const connectionTest = await client.testConnection();
    console.log('Connection test result:', connectionTest);

    if (!connectionTest.success) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Connection test failed',
        message: connectionTest.message,
        details: connectionTest.details,
        troubleshooting: {
          possibleCauses: [
            'Invalid API key',
            'Expired API key',
            'Network connectivity issue',
            'AgentQL service unavailable'
          ],
          nextSteps: [
            'Verify your AgentQL API key is correct',
            'Check if your AgentQL account is active',
            'Try generating a new API key'
          ]
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'AgentQL API test completed successfully',
      connectionTest: connectionTest,
      apiKeyStatus: {
        configured: true,
        length: apiKey.length,
        format: 'Valid format detected'
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Test function error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Test function failed',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
