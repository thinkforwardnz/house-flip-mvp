import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';
import { corsHeaders } from '../shared/cors.ts';

// Helper types
interface Params {
  dealId: string;
  address?: string;
  suburb?: string;
  city?: string;
  bedrooms?: number;
  bathrooms?: number;
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

function median(values: number[]): number | null {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json()) as Params;
    const { dealId, address, suburb, city, bedrooms, bathrooms } = body || {} as Params;

    if (!dealId) {
      return new Response(JSON.stringify({ success: false, message: 'dealId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[market-analysis] start', { dealId, address, suburb, city, bedrooms, bathrooms });

    // 1) Fetch the deal and its property for floor area and existing market_analysis
    const { data: deal, error: dealError } = await supabase
      .from('deals')
      .select('id, property_id, market_analysis, purchase_price, target_sale_price')
      .eq('id', dealId)
      .maybeSingle();

    if (dealError) {
      console.error('[market-analysis] deal fetch error', dealError);
      return new Response(JSON.stringify({ success: false, message: 'Deal fetch failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let property: any = null;
    if (deal?.property_id) {
      const { data: prop, error: propError } = await supabase
        .from('unified_properties')
        .select('address, suburb, city, bedrooms, bathrooms, floor_area, land_area, property_type, sale_date, current_price, source_url')
        .eq('id', deal.property_id)
        .maybeSingle();
      if (!propError && prop) property = prop;
    }

    const subject = {
      address: address ?? property?.address,
      suburb: suburb ?? property?.suburb,
      city: city ?? property?.city,
      bedrooms: bedrooms ?? property?.bedrooms,
      bathrooms: bathrooms ?? property?.bathrooms,
      floor_area: property?.floor_area as number | undefined,
    };

    // 2) Try to gather simple comparable sales from unified_properties
    let comps: any[] = [];
    try {
      const compCity = subject.city || null;
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
      const { data: maybeComps, error: compsError } = await supabase
        .from('unified_properties')
        .select('address, bedrooms, bathrooms, floor_area, land_area, property_type, sale_date, current_price, source_url, suburb, city')
        .limit(100);

      if (compsError) {
        console.warn('[market-analysis] comps fetch warning', compsError);
      } else {
        comps = (maybeComps || [])
          .filter((r) => r.sale_date && r.current_price)
          .filter((r) => !compCity || r.city === compCity)
          .filter((r) => {
            const sd = new Date(r.sale_date);
            return !isNaN(sd.getTime()) && sd >= twelveMonthsAgo;
          })
          .filter((r) => {
            // Roughly similar by beds/baths (+/-1) if subject provided
            const bedOk = subject.bedrooms == null || r.bedrooms == null || Math.abs((r.bedrooms ?? 0) - (subject.bedrooms ?? 0)) <= 1;
            const bathOk = subject.bathrooms == null || r.bathrooms == null || Math.abs((Number(r.bathrooms ?? 0) - Number(subject.bathrooms ?? 0))) <= 1;
            // Similar floor area (+/- 25%) if both present
            const faOk = subject.floor_area == null || r.floor_area == null || (r.floor_area >= subject.floor_area * 0.75 && r.floor_area <= subject.floor_area * 1.25);
            return bedOk && bathOk && faOk;
          })
          .slice(0, 25)
          .map((r) => ({
            address: r.address,
            sold_price: Number(r.current_price),
            sold_date: r.sale_date,
            bedrooms: r.bedrooms ?? undefined,
            bathrooms: r.bathrooms != null ? Number(r.bathrooms) : undefined,
            floor_area: r.floor_area != null ? Number(r.floor_area) : undefined,
            land_area: r.land_area != null ? Number(r.land_area) : undefined,
            property_type: r.property_type ?? undefined,
            days_on_market: undefined,
            listing_url: r.source_url ?? undefined,
          }));
      }
    } catch (e) {
      console.warn('[market-analysis] comps step failed, continuing', e);
    }

    // 3) Compute simple stats
    const soldPrices = comps.map((c) => c.sold_price).filter((n) => typeof n === 'number');
    const low = soldPrices.length ? Math.min(...soldPrices) : undefined;
    const high = soldPrices.length ? Math.max(...soldPrices) : undefined;
    const med = median(soldPrices) ?? undefined;

    // Subject price per sqm (if we have a subject floor area)
    let pricePerSqm: number | undefined = undefined;
    if (med && subject.floor_area) {
      pricePerSqm = med / subject.floor_area;
    } else if (comps.length) {
      const pps: number[] = comps
        .map((c) => (c.sold_price && c.floor_area ? c.sold_price / c.floor_area : null))
        .filter((v): v is number => !!v);
      pricePerSqm = median(pps) ?? undefined;
    }

    const confidence = Math.max(30, Math.min(95, (comps.length || 1) * 5));

    const analysis = {
      estimated_arv: med ?? deal?.target_sale_price ?? deal?.purchase_price ?? undefined,
      market_trend: 'stable' as const,
      avg_days_on_market: 30,
      price_per_sqm: pricePerSqm ? Math.round(pricePerSqm) : undefined,
      market_confidence: Math.round(confidence),
      rental_yield: 4.0,
      insights: comps.length ? `Based on ${comps.length} recent sales in ${subject.city || 'the area'}.` : 'Limited local comps; used heuristic estimation.',
      location_score: undefined,
    };

    // Merge with existing market_analysis to preserve condition_assessment or other fields
    const existing = (deal?.market_analysis && typeof deal.market_analysis === 'object') ? deal.market_analysis : {};
    const updatedMarketAnalysis = {
      ...existing,
      analysis,
      comparables: comps,
    };

    const { error: updateError } = await supabase
      .from('deals')
      .update({ market_analysis: updatedMarketAnalysis })
      .eq('id', dealId);

    if (updateError) {
      console.error('[market-analysis] update error', updateError);
      return new Response(JSON.stringify({ success: false, message: 'Failed updating deal with market analysis' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[market-analysis] complete', { dealId, comps: comps.length });

    return new Response(JSON.stringify({
      success: true,
      updatedFields: { market_analysis: updatedMarketAnalysis },
      message: 'Market analysis completed successfully'
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    console.error('[market-analysis] error', error);
    const message = error instanceof Error ? error.message : 'Unexpected error';
    return new Response(JSON.stringify({ success: false, message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
