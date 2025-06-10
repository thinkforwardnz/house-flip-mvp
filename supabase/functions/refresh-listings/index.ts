import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { errorResponse } from '../shared/error-response.ts';

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
    const { filters = {}, sources = ['trademe', 'realestate', 'oneroof'] } = await req.json();

    console.log('Manual refresh triggered with filters:', filters, 'sources:', sources);

    // Trigger scraping from multiple sources in parallel
    const scrapingPromises = [];

    if (sources.includes('trademe')) {
      scrapingPromises.push(
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-trademe`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filters }),
        })
      );
    }

    if (sources.includes('realestate')) {
      scrapingPromises.push(
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-realestate`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filters }),
        })
      );
    }

    if (sources.includes('oneroof')) {
      scrapingPromises.push(
        fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/scrape-oneroof`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ filters }),
        })
      );
    }

    // Wait for all scraping jobs to complete
    const results = await Promise.allSettled(scrapingPromises);
    
    let totalScraped = 0;
    let totalSkipped = 0;
    const errors = [];
    const sourceResults = [];

    for (const result of results) {
      if (result.status === 'fulfilled') {
        try {
          const data = await result.value.json();
          if (data.success) {
            totalScraped += data.scraped;
            totalSkipped += data.skipped;
            sourceResults.push({
              source: data.source,
              scraped: data.scraped,
              skipped: data.skipped,
              total: data.total
            });
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
        errors: errors,
        sources: sourceResults
      },
      timestamp: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in refresh-listings function:', error);
    return errorResponse(error.message || 'refresh-listings failed', 500);
  }
});
