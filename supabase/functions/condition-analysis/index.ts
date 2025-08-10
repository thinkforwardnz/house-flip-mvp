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

async function fetchDealAndProperty(dealId: string) {
  const { data: deal, error: dealError } = await supabase
    .from('deals')
    .select('id, property_id, market_analysis, listing_details')
    .eq('id', dealId)
    .single();
  if (dealError) throw dealError;

  let property: any = null;
  if (deal?.property_id) {
    const { data: prop, error: propError } = await supabase
      .from('unified_properties')
      .select('photos, description, address, bedrooms, bathrooms, floor_area, land_area, property_type')
      .eq('id', deal.property_id)
      .single();
    if (propError) {
      console.warn('No unified_properties found for property_id', deal.property_id);
    } else {
      property = prop;
    }
  }
  return { deal, property };
}

function buildPromptContext(property: any, description?: string) {
  const lines: string[] = [];
  if (property?.address) lines.push(`Address: ${property.address}`);
  if (property?.property_type) lines.push(`Type: ${property.property_type}`);
  if (property?.bedrooms) lines.push(`Bedrooms: ${property.bedrooms}`);
  if (property?.bathrooms) lines.push(`Bathrooms: ${property.bathrooms}`);
  if (property?.floor_area) lines.push(`Floor area: ${property.floor_area} m2`);
  if (property?.land_area) lines.push(`Land area: ${property.land_area} m2`);
  if (description) lines.push(`Listing notes: ${description}`);
  return lines.join('\n');
}

function safeParseJSON(text: string) {
  try {
    return JSON.parse(text);
  } catch (_) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try { return JSON.parse(match[0]); } catch { /* ignore */ }
    }
    return null;
  }
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { dealId, photos, description } = await req.json();
    if (!dealId) {
      return new Response(JSON.stringify({ success: false, message: 'dealId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { deal, property } = await fetchDealAndProperty(dealId);

    const photoUrls: string[] = Array.isArray(photos) && photos.length > 0
      ? photos
      : Array.isArray(property?.photos) ? property.photos : [];

    const filtered = photoUrls.filter((u) => typeof u === 'string' && /^https?:\/\//.test(u)).slice(0, 10);
    if (filtered.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'No valid photo URLs available for condition analysis.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(JSON.stringify({ success: false, message: 'OPENAI_API_KEY is not set' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const contextText = buildPromptContext(property, description || property?.description);

    const messages = [
      {
        role: 'system',
        content: 'You are a property condition surveyor for house flips in New Zealand. Be concise, objective, and output strict JSON only.'
      },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Assess the current AS-IS condition based on these photos and notes. Output strict JSON with fields: overall_condition { label: Excellent|Good|Fair|Poor, score 0-100, rationale, confidence 0-1 }, areas { exterior, roof, windows, kitchen, bathrooms, flooring, paint, moisture_mold, landscaping } each with { condition, severity low|medium|high, notes[] }, red_flags[], quick_wins[], photo_evidence[{photo_index, note}].\nContext:\n${contextText}` },
          ...filtered.map((url) => ({ type: 'image_url', image_url: { url } }))
        ]
      }
    ];

    const aiResp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        temperature: 0.2,
      }),
    });

    if (!aiResp.ok) {
      const errText = await aiResp.text();
      console.error('OpenAI error:', errText);
      return new Response(JSON.stringify({ success: false, message: 'OpenAI request failed', details: errText }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content ?? '';
    const parsed = typeof content === 'string' ? safeParseJSON(content) : content;

    if (!parsed || !parsed.overall_condition) {
      console.warn('Failed to parse AI JSON, content:', content);
      return new Response(JSON.stringify({ success: false, message: 'Could not parse AI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const existing = (deal?.market_analysis && typeof deal.market_analysis === 'object') ? deal.market_analysis : {};
    const updatedMarketAnalysis = { ...existing, condition_assessment: parsed };

    const { error: updateError } = await supabase
      .from('deals')
      .update({ market_analysis: updatedMarketAnalysis })
      .eq('id', dealId);

    if (updateError) {
      console.error('Failed updating deal with condition_assessment:', updateError);
      return new Response(JSON.stringify({ success: false, message: 'DB update failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      updatedFields: { market_analysis: updatedMarketAnalysis },
      message: 'Condition assessment completed',
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error: unknown) {
    console.error('Condition analysis error:', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
