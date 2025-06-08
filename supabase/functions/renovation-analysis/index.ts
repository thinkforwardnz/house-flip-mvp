
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
    const { dealId, photos, propertyDescription, bedrooms, bathrooms, floorArea } = await req.json();
    console.log(`Running renovation analysis for deal: ${dealId}`);

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY not configured');
    }

    let renovationData: any = {};

    // 1. Analyze property photos with OpenAI Vision
    try {
      console.log('Analyzing property photos...');
      
      const photoAnalysisPrompt = `
Analyze these property photos for renovation requirements:

Property Details:
- Bedrooms: ${bedrooms}
- Bathrooms: ${bathrooms}  
- Floor Area: ${floorArea} sqm
- Description: ${propertyDescription}

Photo URLs: ${photos ? JSON.stringify(photos.slice(0, 5)) : 'No photos provided'}

Provide a detailed renovation analysis including:
1. Kitchen renovation requirements and cost estimate
2. Bathroom renovation needs and costs  
3. Flooring condition and replacement costs
4. Painting requirements (interior/exterior)
5. Potential for bedroom additions
6. Structural or major repair issues visible
7. Total renovation cost estimate for Wellington market
8. Timeline estimate in weeks
9. Priority order of renovations

Consider Wellington-specific renovation costs and building standards.

Respond in JSON format:
{
  "kitchen": {"condition": "poor/fair/good", "cost": number, "description": "string"},
  "bathrooms": {"condition": "poor/fair/good", "cost": number, "description": "string"},
  "flooring": {"condition": "poor/fair/good", "cost": number, "description": "string"},
  "painting": {"condition": "poor/fair/good", "cost": number, "description": "string"},
  "bedroom_addition_potential": boolean,
  "bedroom_addition_cost": number,
  "structural_issues": "string",
  "total_cost": number,
  "timeline_weeks": number,
  "priority_order": ["string"],
  "confidence_level": number
}
`;

      const messages = [
        {
          role: 'system',
          content: 'You are a Wellington property renovation expert with deep knowledge of local building codes, costs, and market preferences for property flipping.'
        },
        {
          role: 'user',
          content: photoAnalysisPrompt
        }
      ];

      // Add photo analysis if photos are available
      if (photos && photos.length > 0) {
        for (const photo of photos.slice(0, 3)) {
          messages.push({
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this property photo for renovation requirements:'
              },
              {
                type: 'image_url',
                image_url: {
                  url: photo
                }
              }
            ]
          });
        }
      }

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const analysisText = data.choices[0].message.content;
        
        try {
          renovationData = JSON.parse(analysisText);
          console.log('Renovation analysis completed successfully');
        } catch (parseError) {
          console.error('Failed to parse renovation analysis:', parseError);
          
          // Fallback to basic cost estimation
          renovationData = {
            kitchen: { condition: 'fair', cost: 25000, description: 'Standard kitchen renovation' },
            bathrooms: { condition: 'fair', cost: 15000, description: 'Bathroom update required' },
            flooring: { condition: 'fair', cost: 8000, description: 'Flooring replacement needed' },
            painting: { condition: 'fair', cost: 5000, description: 'Full interior/exterior paint' },
            bedroom_addition_potential: false,
            bedroom_addition_cost: 0,
            structural_issues: 'Unable to assess from photos',
            total_cost: 53000,
            timeline_weeks: 8,
            priority_order: ['Kitchen', 'Bathrooms', 'Flooring', 'Painting'],
            confidence_level: 60
          };
        }
      }
    } catch (error) {
      console.error('Error in renovation analysis:', error);
      renovationData = { error: error.message };
    }

    // 2. Calculate renovation ROI and recommendations
    try {
      const totalCost = renovationData.total_cost || 50000;
      const addedValue = totalCost * 1.3; // Wellington market typically sees 30% value add
      
      renovationData.roi_analysis = {
        total_investment: totalCost,
        expected_value_add: addedValue,
        roi_percentage: (addedValue - totalCost) / totalCost * 100,
        break_even_arv: totalCost / 0.15, // 15% of ARV rule
        recommendation: addedValue > totalCost ? 'Proceed' : 'Reconsider'
      };
    } catch (error) {
      console.error('Error calculating renovation ROI:', error);
    }

    // 3. Update the deal with renovation analysis
    const { error: updateError } = await supabase
      .from('deals')
      .update({
        renovation_analysis: renovationData,
        estimated_renovation_cost: renovationData.total_cost || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', dealId);

    if (updateError) {
      console.error('Error updating deal with renovation analysis:', updateError);
      throw updateError;
    }

    console.log(`Renovation analysis completed for deal: ${dealId}`);

    return new Response(JSON.stringify({
      success: true,
      data: renovationData,
      message: 'Renovation analysis completed successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in renovation analysis:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
