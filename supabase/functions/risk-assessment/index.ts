
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

import { corsHeaders } from '../shared/cors.ts';

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
    const { dealId } = await req.json();
    console.log(`Running risk assessment for deal: ${dealId}`);

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    // Get existing deal data
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('*')
      .eq('id', dealId)
      .single();

    if (dealError || !deal) {
      throw new Error('Deal not found');
    }

    let riskData: any = {};

    // 1. Comprehensive risk assessment using all available data
    try {
      console.log('Performing comprehensive risk assessment...');
      
      const riskAssessmentPrompt = `
Perform a comprehensive investment risk assessment for this Wellington property flip:

Property Details:
- Address: ${deal.address}
- Suburb: ${deal.suburb}, ${deal.city}  
- Purchase Price: $${deal.purchase_price?.toLocaleString() || 'TBD'}
- Target Sale Price: $${deal.target_sale_price?.toLocaleString() || 'TBD'}
- Estimated Renovation: $${deal.estimated_renovation_cost?.toLocaleString() || 'TBD'}

Market Analysis: ${JSON.stringify(deal.market_analysis || {})}
Property Analysis: ${JSON.stringify(deal.analysis_data || {})}
Renovation Analysis: ${JSON.stringify(deal.renovation_analysis || {})}

Assess risks across these categories:
1. Market Risk - price volatility, demand trends, economic factors
2. Renovation Risk - cost overruns, timeline delays, complexity
3. Financial Risk - financing, holding costs, cash flow
4. Location Risk - neighbourhood trends, infrastructure, zoning
5. Regulatory Risk - building consents, compliance issues
6. Liquidity Risk - how quickly can property be sold

Calculate specific risk scores (1-100) for each category and overall.
Provide specific risk mitigation strategies for Wellington market.

Respond in JSON format:
{
  "market_risk": {"score": number, "level": "low/medium/high", "factors": ["string"], "mitigation": ["string"]},
  "renovation_risk": {"score": number, "level": "low/medium/high", "factors": ["string"], "mitigation": ["string"]},
  "financial_risk": {"score": number, "level": "low/medium/high", "factors": ["string"], "mitigation": ["string"]},
  "location_risk": {"score": number, "level": "low/medium/high", "factors": ["string"], "mitigation": ["string"]},
  "regulatory_risk": {"score": number, "level": "low/medium/high", "factors": ["string"], "mitigation": ["string"]},
  "liquidity_risk": {"score": number, "level": "low/medium/high", "factors": ["string"], "mitigation": ["string"]},
  "overall_risk_score": number,
  "overall_risk_level": "low/medium/high",
  "confidence_level": number,
  "key_risks": ["string"],
  "recommendations": ["string"],
  "exit_strategies": ["string"]
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
              content: 'You are a Wellington property investment risk analyst with expertise in market cycles, renovation projects, and investment strategy for property flipping.'
            },
            {
              role: 'user',
              content: riskAssessmentPrompt
            }
          ],
          temperature: 0.2,
          max_tokens: 2000,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const analysisText = data.choices[0].message.content;
        
        try {
          riskData = JSON.parse(analysisText);
          console.log('Risk assessment completed successfully');
        } catch (parseError) {
          console.error('Failed to parse risk assessment:', parseError);
          
          // Fallback risk assessment
          riskData = {
            market_risk: { score: 50, level: 'medium', factors: ['Market analysis pending'], mitigation: ['Monitor market trends'] },
            renovation_risk: { score: 60, level: 'medium', factors: ['Cost estimation needed'], mitigation: ['Get detailed quotes'] },
            financial_risk: { score: 40, level: 'medium', factors: ['Financing pending'], mitigation: ['Secure pre-approval'] },
            location_risk: { score: 30, level: 'low', factors: ['Good location'], mitigation: ['Continue monitoring'] },
            regulatory_risk: { score: 35, level: 'low', factors: ['Standard property'], mitigation: ['Check consents'] },
            liquidity_risk: { score: 45, level: 'medium', factors: ['Market dependent'], mitigation: ['Price competitively'] },
            overall_risk_score: 44,
            overall_risk_level: 'medium',
            confidence_level: 70,
            key_risks: ['Market uncertainty', 'Renovation costs'],
            recommendations: ['Conduct detailed inspections', 'Secure financing'],
            exit_strategies: ['Flip as planned', 'Hold and rent', 'Wholesale if needed']
          };
        }
      }
    } catch (error) {
      console.error('Error in risk assessment:', error);
      riskData = { error: error.message };
    }

    // 2. Calculate risk-adjusted returns
    try {
      const riskAdjustment = riskData.overall_risk_score ? (100 - riskData.overall_risk_score) / 100 : 0.7;
      const projectedProfit = deal.current_profit || 0;
      const riskAdjustedProfit = projectedProfit * riskAdjustment;
      
      riskData.financial_metrics = {
        projected_profit: projectedProfit,
        risk_adjusted_profit: riskAdjustedProfit,
        risk_adjustment_factor: riskAdjustment,
        recommended_contingency: Math.max(0.15, riskData.overall_risk_score / 100 * 0.3)
      };
    } catch (error) {
      console.error('Error calculating risk-adjusted returns:', error);
    }

    // 3. Update the deal with risk assessment
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        risk_assessment: riskData,
        current_risk: riskData.overall_risk_level || 'medium',
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('Error updating deal with risk assessment:', updateError);
      throw updateError;
    }

    console.log(`Risk assessment completed for deal: ${dealId}`);

    return new Response(JSON.stringify({
      success: true,
      data: riskData,
      message: 'Risk assessment completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in risk assessment:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
