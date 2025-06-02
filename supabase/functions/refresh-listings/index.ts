
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {} } = await req.json();

    console.log('Manual refresh triggered with filters:', filters);

    // Trigger scraping from multiple sources
    const scrapingPromises = [
      fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-trademe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filters }),
      })
    ];

    // Wait for all scraping jobs to complete
    const results = await Promise.allSettled(scrapingPromises);
    
    let totalScraped = 0;
    let totalSkipped = 0;
    const errors = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        try {
          const data = await result.value.json();
          if (data.success) {
            totalScraped += data.scraped;
            totalSkipped += data.skipped;
          } else {
            errors.push(data.error);
          }
        } catch (parseError) {
          errors.push('Failed to parse scraping response');
        }
      } else {
        errors.push(result.reason?.message || 'Scraping job failed');
      }
    }

    return new Response(JSON.stringify({
      success: true,
      results: {
        scraped: totalScraped,
        skipped: totalSkipped,
        errors: errors
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refresh-listings function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
