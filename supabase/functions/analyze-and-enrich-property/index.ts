
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from '../shared/cors.ts';
import { AgentQLClient } from '../shared/agentql-client.ts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// AI-powered property analysis
async function analyzePropertyForFlipping(property: any): Promise<any> {
  if (!openAIApiKey) {
    return null;
  }

  try {
    const prompt = `Analyze this New Zealand property for house flipping potential:

Property: ${property.address}
Price: $${property.price}
Bedrooms: ${property.bedrooms || 'Unknown'}
Bathrooms: ${property.bathrooms || 'Unknown'}
Floor Area: ${property.floor_area || 'Unknown'}m²
Land Area: ${property.land_area || 'Unknown'}m²
Description: ${property.description || property.summary || 'No description available'}

Provide a detailed analysis including:
1. Estimated renovation cost (NZD)
2. After renovation value (ARV) (NZD)
3. Projected profit (NZD)
4. Flip potential (High/Medium/Low)
5. Key renovation recommendations
6. Market risks to consider

Respond in JSON format:
{
  "renovation_cost": 150000,
  "arv": 850000,
  "projected_profit": 150000,
  "flip_potential": "High",
  "confidence": 85,
  "renovation_recommendations": ["Kitchen upgrade", "Bathroom renovation"],
  "market_risks": ["Interest rate changes", "Market cooling"]
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
            content: 'You are a New Zealand property investment expert specializing in house flipping analysis. Provide realistic NZD estimates based on current market conditions.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
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
    console.error('Error in AI property analysis:', error);
  }
  
  return null;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId } = await req.json();
    console.log(`Starting detailed analysis and enrichment for listing: ${listingId}`);

    if (!listingId) {
      throw new Error('Listing ID is required');
    }

    // Get the basic listing data
    const { data: listing, error: listingError } = await supabase
      .from('scraped_listings')
      .select('*')
      .eq('id', listingId)
      .single();

    if (listingError || !listing) {
      throw new Error(`Listing not found: ${listingError?.message}`);
    }

    console.log(`Enriching listing: ${listing.address} from ${listing.source_url}`);

    let enrichedData: any = {};
    let agentqlClient;

    // Initialize AgentQL client for detailed property page scraping
    try {
      agentqlClient = new AgentQLClient();
      console.log('AgentQL client initialized for detailed scraping');
    } catch (error) {
      console.error('Failed to initialize AgentQL client:', error);
      throw new Error('Failed to initialize property data collection');
    }

    // Stage 1: Scrape detailed property page data
    if (listing.source_url) {
      try {
        console.log(`Scraping detailed property page: ${listing.source_url}`);
        const propertyPageData = await agentqlClient.scrapePropertyPage(listing.source_url);
        
        if (propertyPageData) {
          enrichedData = {
            bedrooms: propertyPageData.bedrooms || listing.bedrooms,
            bathrooms: propertyPageData.bathrooms || listing.bathrooms,
            floor_area: propertyPageData.floor_area || listing.floor_area,
            land_area: propertyPageData.land_area || listing.land_area,
            photos: propertyPageData.photos?.length > 0 ? propertyPageData.photos : listing.photos,
            summary: propertyPageData.description || listing.summary,
            // Store detailed listing information
            listing_details: {
              title: propertyPageData.title,
              method: propertyPageData.method,
              type: propertyPageData.type,
              parking: propertyPageData.parking,
              internet: propertyPageData.internet,
              other_features: propertyPageData.other_features,
              date: propertyPageData.date
            }
          };
          console.log('Detailed property data collected:', {
            bedrooms: enrichedData.bedrooms,
            bathrooms: enrichedData.bathrooms,
            floor_area: enrichedData.floor_area,
            land_area: enrichedData.land_area,
            photos_count: enrichedData.photos?.length || 0
          });
        }
      } catch (error) {
        console.error('Error scraping detailed property page:', error);
      }
    }

    // Stage 2: AI Analysis for flipping potential
    const propertyForAnalysis = {
      ...listing,
      ...enrichedData
    };

    const aiAnalysis = await analyzePropertyForFlipping(propertyForAnalysis);
    
    if (aiAnalysis && !aiAnalysis.error) {
      enrichedData.ai_est_profit = aiAnalysis.projected_profit || null;
      enrichedData.ai_reno_cost = aiAnalysis.renovation_cost || null;
      enrichedData.ai_arv = aiAnalysis.arv || null;
      enrichedData.ai_confidence = aiAnalysis.confidence || null;
      enrichedData.flip_potential = aiAnalysis.flip_potential?.toLowerCase() || null;
      enrichedData.ai_score = aiAnalysis.confidence || null;
      
      console.log('AI analysis completed:', {
        profit: aiAnalysis.projected_profit,
        renovation_cost: aiAnalysis.renovation_cost,
        arv: aiAnalysis.arv,
        flip_potential: aiAnalysis.flip_potential
      });
    }

    // Update the listing with enriched data
    if (Object.keys(enrichedData).length > 0) {
      const updateData = {
        ...enrichedData,
        updated_at: new Date().toISOString()
      };

      const { error: updateError } = await supabase
        .from('scraped_listings')
        .update(updateData)
        .eq('id', listingId);

      if (updateError) {
        console.error('Error updating listing with enriched data:', updateError);
        throw updateError;
      }

      console.log(`Successfully enriched listing ${listingId} with detailed data and AI analysis`);

      return new Response(JSON.stringify({
        success: true,
        data: enrichedData,
        message: 'Property analyzed and enriched successfully',
        ai_analysis_performed: !!aiAnalysis
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } else {
      return new Response(JSON.stringify({
        success: false,
        message: 'No additional property data could be collected',
        data: {}
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in property analysis and enrichment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
