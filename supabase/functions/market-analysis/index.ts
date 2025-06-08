
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from '../shared/cors.ts';
import { AgentQLClient } from '../shared/agentql-client.ts';
import { parseAIResponse } from '../shared/json-parser.ts';

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
    const { dealId, address, suburb, city, bedrooms, bathrooms } = await req.json();
    console.log(`Running market analysis for: ${address}, ${suburb}, ${city}`);

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    let marketData: any = {};

    // 1. Use AgentQL to scrape comparable sales
    try {
      console.log('Scraping comparable sales with AgentQL...');
      const agentqlClient = new AgentQLClient();
      
      // Search for recent sales in the area using the new method
      const comparables = await agentqlClient.scrapeComparableSales(address, suburb, city);
      
      marketData.comparables = comparables || [];
      console.log(`Found ${marketData.comparables.length} comparable sales`);
    } catch (error) {
      console.error('Error scraping comparables:', error);
      marketData.comparables = [];
    }

    // 2. Calculate market statistics using OpenAI
    try {
      console.log('Analyzing market data with OpenAI...');
      
      const marketAnalysisPrompt = `
Analyze the Wellington property market for this property:
- Address: ${address}
- Suburb: ${suburb}, ${city}
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}

Comparable sales data: ${JSON.stringify(marketData.comparables.slice(0, 5))}

Provide a comprehensive market analysis including:
1. Estimated current market value (ARV)
2. Market trend (increasing/stable/declining)
3. Days on market average for the area
4. Price per square meter if available
5. Market confidence level (1-100%)
6. Rental yield estimate
7. Key market insights for flipping

Respond in JSON format:
{
  "estimated_arv": number,
  "market_trend": "increasing" | "stable" | "declining",
  "avg_days_on_market": number,
  "price_per_sqm": number,
  "market_confidence": number,
  "rental_yield": number,
  "insights": "string with key market insights"
}
`;

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
              content: 'You are a Wellington property market expert specializing in investment analysis and property flipping.'
            },
            {
              role: 'user',
              content: marketAnalysisPrompt
            }
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const analysisText = data.choices[0].message.content;
        
        try {
          marketData.analysis = parseAIResponse(analysisText);
          console.log('Market analysis completed successfully');
        } catch (parseError) {
          console.error('Failed to parse market analysis:', parseError);
          marketData.analysis = { error: 'Failed to parse analysis' };
        }
      }
    } catch (error) {
      console.error('Error in market analysis:', error);
      marketData.analysis = { error: error.message };
    }

    // 3. Calculate investment metrics
    const purchasePrice = marketData.analysis?.estimated_arv ? marketData.analysis.estimated_arv * 0.8 : 0;
    const renovationCost = marketData.analysis?.estimated_arv ? marketData.analysis.estimated_arv * 0.15 : 0;
    const projectedProfit = marketData.analysis?.estimated_arv ? 
      marketData.analysis.estimated_arv - purchasePrice - renovationCost - (marketData.analysis.estimated_arv * 0.1) : 0;

    marketData.investment_metrics = {
      max_purchase_price: purchasePrice,
      estimated_renovation_cost: renovationCost,
      projected_profit: projectedProfit,
      roi_percentage: purchasePrice > 0 ? (projectedProfit / purchasePrice) * 100 : 0
    };

    // 4. Update the deal with market analysis
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        target_sale_price: marketData.analysis?.estimated_arv || null,
        current_profit: projectedProfit,
        market_analysis: marketData,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('Error updating deal with market analysis:', updateError);
      throw updateError;
    }

    console.log(`Market analysis completed for deal: ${dealId}`);

    return new Response(JSON.stringify({
      success: true,
      data: marketData,
      message: 'Market analysis completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in market analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
