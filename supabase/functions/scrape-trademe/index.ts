
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';
import { AgentQLClient } from '../shared/agentql-client.ts';
import { processTrademeListing } from './data-processor.ts';
import { buildTradeeMeSearchUrl } from './url-builder.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// AI-powered description analysis
async function analyzePropertyDescription(description: string, address: string): Promise<any> {
  if (!openAIApiKey || !description) {
    return null;
  }

  try {
    const prompt = `Analyze this New Zealand property listing description for house flipping potential:

Property: ${address}
Description: ${description}

Extract and analyze:
1. Property condition (excellent/good/fair/poor/needs_renovation)
2. Renovation requirements (list specific areas needing work)
3. Flip potential score (1-10, where 10 is highest potential)
4. Key features that add value
5. Potential red flags or issues
6. Estimated renovation complexity (low/medium/high)
7. Special selling points for resale

Respond in JSON format:
{
  "condition": "needs_renovation",
  "renovation_requirements": ["kitchen", "bathroom", "flooring"],
  "flip_potential_score": 8,
  "value_features": ["large section", "good bones"],
  "red_flags": ["foundation issues mentioned"],
  "renovation_complexity": "medium",
  "selling_points": ["location", "potential"]
}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are a New Zealand property investment expert specializing in house flipping analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const analysisText = data.choices[0].message.content;
      
      try {
        return JSON.parse(analysisText);
      } catch (parseError) {
        console.error('Failed to parse AI analysis:', parseError);
        return { error: 'Failed to parse analysis' };
      }
    }
  } catch (error) {
    console.error('Error in AI description analysis:', error);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { filters = {} } = await req.json();
    console.log('Starting Trade Me scraping with AgentQL and filters:', filters);

    // Initialize AgentQL client
    const agentqlClient = new AgentQLClient();
    
    // Build search URL based on filters
    const searchUrl = buildTradeeMeSearchUrl(filters);
    console.log('Built search URL:', searchUrl);

    // Stage 1: Scrape search results to get basic listing metadata
    console.log('Stage 1: Scraping search results...');
    const searchResults = await agentqlClient.scrapeSearchResults(searchUrl);
    
    if (!searchResults?.data?.properties || !Array.isArray(searchResults.data.properties)) {
      console.error('No properties found in search results');
      return new Response(JSON.stringify({
        success: false,
        error: 'No properties found in search results',
        total_processed: 0,
        total_saved: 0
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log(`Found ${searchResults.data.properties.length} properties in search results`);

    // Stage 2: Process each property for enrichment
    const processedListings = [];
    const maxListings = 20; // Limit for initial implementation
    
    for (let i = 0; i < Math.min(searchResults.data.properties.length, maxListings); i++) {
      const property = searchResults.data.properties[i];
      
      try {
        console.log(`Processing property ${i + 1}/${Math.min(searchResults.data.properties.length, maxListings)}: ${property.listingaddress}`);
        
        // Rate limiting between requests
        if (i > 0) {
          await agentqlClient.rateLimitDelay();
        }

        // Stage 2a: Get detailed property page data
        let enrichedData = {
          listingid: property.listingid,
          listingurl: property.listingurl,
          listingaddress: property.listingaddress,
          listingfeaturedimg: property.listingfeaturedimg,
          photos: property.listingfeaturedimg ? [property.listingfeaturedimg] : [],
        };

        // If we have a property URL, scrape the individual page for more details
        if (property.listingurl) {
          try {
            const propertyPageData = await agentqlClient.scrapePropertyPage(property.listingurl);
            
            if (propertyPageData) {
              enrichedData = {
                ...enrichedData,
                ...propertyPageData,
                // Merge photos, prioritizing property page photos
                photos: propertyPageData.photos?.length > 0 
                  ? propertyPageData.photos 
                  : enrichedData.photos
              };
            }
          } catch (pageError) {
            console.error(`Error scraping property page for ${property.listingurl}:`, pageError);
            // Continue with basic data if page scraping fails
          }
        }

        // Stage 2b: AI analysis of description if available
        let aiAnalysis = null;
        if (enrichedData.description || enrichedData.summary) {
          const description = enrichedData.description || enrichedData.summary;
          aiAnalysis = await analyzePropertyDescription(description, property.listingaddress);
        }

        // Stage 3: Process and normalize the data
        const processed = processTrademeListing({
          ...enrichedData,
          url: property.listingurl,
          address: property.listingaddress,
          ai_analysis: aiAnalysis
        });

        if (processed) {
          processedListings.push(processed);
        }

      } catch (error) {
        console.error(`Error processing property ${property.listingaddress}:`, error);
        // Continue with next property
      }
    }

    console.log(`Successfully processed ${processedListings.length} Trade Me listings`);

    // Stage 4: Save to database
    const savedListings = [];
    
    for (const listing of processedListings) {
      try {
        // Check if listing already exists
        const { data: existing } = await supabase
          .from('scraped_listings')
          .select('id')
          .eq('source_url', listing.source_url)
          .single();

        if (!existing) {
          const { data: saved, error } = await supabase
            .from('scraped_listings')
            .insert({
              source_url: listing.source_url,
              source_site: listing.source_site,
              address: listing.address,
              suburb: listing.suburb,
              city: listing.city,
              district: listing.district,
              price: listing.price,
              summary: listing.summary,
              bedrooms: listing.bedrooms,
              bathrooms: listing.bathrooms,
              floor_area: listing.floor_area,
              land_area: listing.land_area,
              photos: listing.photos,
              listing_date: listing.listing_date,
              date_scraped: new Date().toISOString(),
              status: 'new',
              // Add AI analysis fields if available
              ai_score: listing.ai_analysis?.flip_potential_score || null,
              ai_est_profit: null, // Will be calculated later
              ai_reno_cost: null, // Will be calculated later
              ai_arv: null, // Will be calculated later
              ai_confidence: listing.ai_analysis ? 80 : null,
              flip_potential: listing.ai_analysis?.condition === 'needs_renovation' ? 'high' : 
                             listing.ai_analysis?.flip_potential_score >= 7 ? 'medium' : 'low'
            })
            .select()
            .single();

          if (error) {
            console.error('Error saving listing:', error);
          } else {
            savedListings.push(saved);
            console.log(`Saved listing: ${listing.address} with AI score: ${listing.ai_analysis?.flip_potential_score || 'N/A'}`);
          }
        } else {
          console.log('Listing already exists, skipping:', listing.source_url);
        }
      } catch (error) {
        console.error('Error processing listing for database:', error);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Scraped ${processedListings.length} listings with AgentQL, saved ${savedListings.length} new ones`,
      total_processed: processedListings.length,
      total_saved: savedListings.length,
      search_url: searchUrl,
      ai_analysis_enabled: !!openAIApiKey
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Trade Me AgentQL scraping error:', error);
    return new Response(JSON.stringify({
      error: 'Scraping failed',
      details: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
