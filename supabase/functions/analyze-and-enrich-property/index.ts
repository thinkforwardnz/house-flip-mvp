
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { CustomScraperClient } from '../shared/custom-scraper-client.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { propertyUrl, dealId } = await req.json();
    console.log('Starting property analysis and enrichment for URL:', propertyUrl);

    if (!propertyUrl) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Property URL is required'
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Initialize custom scraper client for detailed scraping
    const scraperClient = new CustomScraperClient();
    
    // Scrape the property page for detailed information
    const propertyData = await scraperClient.scrapeProperty(propertyUrl);

    if (!propertyData || !propertyData.structured) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Could not scrape property details',
        message: 'No data could be retrieved from the property page'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const structured = propertyData.structured;
    console.log('Property data scraped successfully:', {
      title: structured.title,
      price: structured.price,
      bedrooms: structured.bedrooms,
      bathrooms: structured.bathrooms
    });

    // Update deal with enriched property data if dealId provided
    if (dealId) {
      // Parse price to numeric value
      const priceMatch = structured.price.match(/[\d,]+/);
      const numericPrice = priceMatch ? parseInt(priceMatch[0].replace(/,/g, '')) : 0;

      const { error: updateError } = await supabase
        .from('deals')
        .update({
          property_data: {
            address: structured.address,
            bedrooms: parseInt(structured.bedrooms) || 0,
            bathrooms: parseInt(structured.bathrooms) || 0,
            floor_area: structured.floor_area,
            land_area: structured.land_area,
            photos: structured.images || [],
            description: structured.description,
            source_url: propertyUrl,
            property_estimates: structured.property_estimates,
            capital_values: structured.capital_values,
            market_trends: structured.market_trends
          },
          purchase_price: numericPrice > 0 ? numericPrice : undefined,
          updated_at: new Date().toISOString()
        })
        .eq('id', dealId);

      if (updateError) {
        console.error('Error updating deal:', updateError);
        return new Response(JSON.stringify({
          success: false,
          error: 'Failed to update deal with property data'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      console.log('Deal updated successfully with property data');
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Property analyzed and enriched successfully',
      propertyData: {
        title: structured.title,
        address: structured.address,
        price: structured.price,
        bedrooms: structured.bedrooms,
        bathrooms: structured.bathrooms,
        floor_area: structured.floor_area,
        land_area: structured.land_area,
        photos_count: structured.images?.length || 0,
        has_description: !!structured.description,
        has_estimates: !!structured.property_estimates
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Property analysis and enrichment error:', error);
    return new Response(JSON.stringify({
      error: 'Property analysis failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
