
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

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, listingData } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Construct analysis prompt with property details
    const analysisPrompt = `
You are a property investment AI analyzing a New Zealand property for flip potential.

Property Details:
- Address: ${listingData.address}
- Suburb: ${listingData.suburb}, ${listingData.city}
- Price: NZD $${listingData.price?.toLocaleString() || 'Unknown'}
- Bedrooms: ${listingData.bedrooms || 'Unknown'}
- Bathrooms: ${listingData.bathrooms || 'Unknown'}
- Floor Area: ${listingData.floor_area || 'Unknown'} sqm
- Land Area: ${listingData.land_area || 'Unknown'} sqm
- Description: ${listingData.summary || 'No description available'}

Based on current NZ property market conditions and typical renovation costs, provide:

1. Estimated renovation cost (NZD) - Consider typical NZ renovation costs for flipping
2. After Repair Value (ARV) estimate (NZD) - Based on comparable sales in the area
3. Projected profit (ARV - Purchase Price - Renovation Cost - Holding Costs ~10%)
4. Flip potential rating (High/Medium/Low)
5. Confidence level (1-100%)
6. Key insights and risks

Respond in JSON format:
{
  "renovation_cost": number,
  "arv": number,
  "projected_profit": number,
  "flip_potential": "High" | "Medium" | "Low",
  "confidence": number,
  "insights": "string with key insights and risks"
}
`;

    console.log(`Analyzing property: ${listingData.address}`);

    // Call OpenAI API
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
            content: 'You are an expert property investment analyst specializing in the New Zealand real estate market. Provide accurate, data-driven analysis for property flipping opportunities.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;

    // Parse JSON response from OpenAI
    let analysis;
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', analysisText);
      throw new Error('Failed to parse AI analysis response');
    }

    // Update the scraped listing with AI analysis
    const { error: updateError } = await supabase
      .from('scraped_listings')
      .update({
        ai_reno_cost: analysis.renovation_cost,
        ai_arv: analysis.arv,
        ai_est_profit: analysis.projected_profit,
        flip_potential: analysis.flip_potential,
        ai_confidence: analysis.confidence,
        ai_score: analysis.confidence, // Using confidence as score for now
        updated_at: new Date().toISOString()
      })
      .eq('id', listingId);

    if (updateError) {
      console.error('Error updating listing with AI analysis:', updateError);
      throw updateError;
    }

    console.log(`Successfully analyzed property ${listingData.address}: ${analysis.flip_potential} potential`);

    return new Response(JSON.stringify({
      success: true,
      analysis: {
        ...analysis,
        listing_id: listingId
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-property function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
