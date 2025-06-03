
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from './config.ts';
import { buildTradeeMeSearchUrl } from './url-builder.ts';
import { processTradeeMeData } from './data-processor.ts';
import { calculateFlipPotential } from './scoring.ts';
import { ScrapingFilters } from './types.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const firecrawlApiKey = Deno.env.get('FIRECRAWL_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { filters = {} }: { filters: ScrapingFilters } = await req.json();
    console.log('Starting TradeMe scraping with Firecrawl for Wellington region');

    if (!firecrawlApiKey) {
      throw new Error('Firecrawl API key not configured');
    }

    // Build TradeMe search URL for Wellington region
    const baseUrl = 'https://www.trademe.co.nz/a/property/residential/sale/wellington';
    const searchUrl = buildTradeeMeSearchUrl(baseUrl, filters);

    console.log('Scraping TradeMe URL:', searchUrl);

    // Use Firecrawl to scrape TradeMe
    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v0/crawl', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${firecrawlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: searchUrl,
        crawlerOptions: {
          includes: ['**/property/residential/**'],
          excludes: ['**/sold/**', '**/withdrawn/**'],
          maxDepth: 2,
          limit: 50
        },
        pageOptions: {
          extractorOptions: {
            mode: 'llm-extraction',
            extractionPrompt: `Extract property listing data including:
              - address
              - price (convert to number)
              - bedrooms (number)
              - bathrooms (number)
              - floor area in sqm
              - land area in sqm
              - description/summary
              - listing URL
              - photos (array of URLs)
              Return as JSON array of properties.`
          }
        }
      }),
    });

    if (!firecrawlResponse.ok) {
      throw new Error(`Firecrawl API error: ${firecrawlResponse.status}`);
    }

    const crawlData = await firecrawlResponse.json();
    console.log('Firecrawl crawl initiated:', crawlData.jobId);

    // Poll for crawl completion
    let crawlComplete = false;
    let attempts = 0;
    const maxAttempts = 30; // 5 minutes max wait
    let crawlResults = null;

    while (!crawlComplete && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // Wait 10 seconds
      
      const statusResponse = await fetch(`https://api.firecrawl.dev/v0/crawl/status/${crawlData.jobId}`, {
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
        },
      });

      const statusData = await statusResponse.json();
      console.log(`Crawl attempt ${attempts + 1}, status:`, statusData.status);

      if (statusData.status === 'completed') {
        crawlComplete = true;
        crawlResults = statusData.data;
      } else if (statusData.status === 'failed') {
        throw new Error('Firecrawl job failed');
      }
      
      attempts++;
    }

    if (!crawlComplete) {
      throw new Error('Crawl timeout - taking longer than expected');
    }

    // Process the scraped data
    const properties = processTradeeMeData(crawlResults);
    
    let savedCount = 0;
    let skippedCount = 0;

    for (const property of properties) {
      try {
        // Check if listing already exists
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', property.source_url)
          .single();

        if (existing) {
          skippedCount++;
          continue;
        }

        // Calculate flip potential score
        const flipScore = calculateFlipPotential(property);

        // Insert new listing
        const { data: newListing, error: insertError } = await supabase
          .from('scraped_listings')
          .insert({
            source_site: 'TradeMe',
            source_url: property.source_url,
            address: property.address,
            suburb: property.suburb,
            city: property.city,
            price: property.price,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            floor_area: property.floor_area,
            land_area: property.land_area,
            summary: property.summary,
            photos: property.photos,
            listing_date: property.listing_date,
            status: 'new',
            ai_score: flipScore
          })
          .select()
          .single();

        if (insertError) {
          console.error('Error inserting listing:', insertError);
          continue;
        }

        // Trigger AI analysis for high-potential properties
        if (newListing && flipScore >= 60) {
          // Note: EdgeRuntime.waitUntil is not available in Deno, using direct call
          analyzeListingInBackground(newListing);
        }
        
        savedCount++;

      } catch (error) {
        console.error('Error processing property:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      scraped: savedCount,
      skipped: skippedCount,
      total: properties.length,
      source: 'TradeMe'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-trademe function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function analyzeListingInBackground(listing: any) {
  try {
    const response = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-property`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        listingId: listing.id,
        listingData: listing
      }),
    });

    if (!response.ok) {
      console.error('Failed to analyze listing:', await response.text());
    } else {
      console.log(`Successfully queued analysis for listing: ${listing.address}`);
    }
  } catch (error) {
    console.error('Error triggering AI analysis:', error);
  }
}
