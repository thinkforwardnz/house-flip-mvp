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

    // 2) Gather comparable sales first; if none, fall back to recent listings
    let comps: any[] = [];
    let usedSource: 'sales' | 'listings' | 'none' = 'none';

    // Helper to filter similarity
    const isSimilar = (r: any) => {
      const bedOk = subject.bedrooms == null || r.bedrooms == null || Math.abs((r.bedrooms ?? 0) - (subject.bedrooms ?? 0)) <= 1;
      const bathOk = subject.bathrooms == null || r.bathrooms == null || Math.abs((Number(r.bathrooms ?? 0) - Number(subject.bathrooms ?? 0))) <= 1;
      const faOk = subject.floor_area == null || r.floor_area == null || (Number(r.floor_area) >= (subject.floor_area as number) * 0.75 && Number(r.floor_area) <= (subject.floor_area as number) * 1.25);
      return bedOk && bathOk && faOk;
    };

    try {
      // Try SOLD comps within last 36 months
      const thirtySixMonthsAgo = new Date();
      thirtySixMonthsAgo.setMonth(thirtySixMonthsAgo.getMonth() - 36);

      let soldQuery = supabase
        .from('unified_properties')
        .select('address, bedrooms, bathrooms, floor_area, land_area, property_type, sale_date, listing_date, current_price, source_url, suburb, city')
        .not('sale_date', 'is', null)
        .gte('sale_date', thirtySixMonthsAgo.toISOString())
        .limit(600);
      if (subject.city) soldQuery = soldQuery.eq('city', subject.city as string);
      if (subject.suburb) soldQuery = soldQuery.eq('suburb', subject.suburb as string);

      const { data: soldRows, error: soldErr } = await soldQuery;
      if (soldErr) {
        console.warn('[market-analysis] sold comps fetch warning', soldErr);
      } else {
        const filtered = (soldRows || []).filter(isSimilar).slice(0, 50);
        if (filtered.length) {
          comps = filtered.map((r) => ({
            address: r.address,
            sold_price: Number(r.current_price) || undefined,
            sold_date: r.sale_date,
            bedrooms: r.bedrooms ?? undefined,
            bathrooms: r.bathrooms != null ? Number(r.bathrooms) : undefined,
            floor_area: r.floor_area != null ? Number(r.floor_area) : undefined,
            land_area: r.land_area != null ? Number(r.land_area) : undefined,
            property_type: r.property_type ?? undefined,
            days_on_market: (r.listing_date && r.sale_date) ? Math.max(0, Math.round((new Date(r.sale_date as string).getTime() - new Date(r.listing_date as string).getTime()) / (1000 * 60 * 60 * 24))) : undefined,
            listing_url: r.source_url ?? undefined,
          }));
          usedSource = 'sales';
        }
      }

      // If no SOLD comps, try LISTINGS within last 6 months
      if (comps.length === 0) {
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        let listQuery = supabase
          .from('unified_properties')
          .select('address, bedrooms, bathrooms, floor_area, land_area, property_type, listing_date, current_price, source_url, suburb, city')
          .not('listing_date', 'is', null)
          .gte('listing_date', sixMonthsAgo.toISOString())
          .not('current_price', 'is', null)
          .limit(600);
        if (subject.city) listQuery = listQuery.eq('city', subject.city as string);
        if (subject.suburb) listQuery = listQuery.eq('suburb', subject.suburb as string);

        const { data: listRows, error: listErr } = await listQuery;
        if (listErr) {
          console.warn('[market-analysis] listing comps fetch warning', listErr);
        } else {
          const filtered = (listRows || []).filter(isSimilar).slice(0, 50);
          if (filtered.length) {
            comps = filtered.map((r) => ({
              address: r.address,
              sold_price: Number(r.current_price) || undefined, // use listing price as proxy
              sold_date: r.listing_date, // treat listing_date as reference
              bedrooms: r.bedrooms ?? undefined,
              bathrooms: r.bathrooms != null ? Number(r.bathrooms) : undefined,
              floor_area: r.floor_area != null ? Number(r.floor_area) : undefined,
              land_area: r.land_area != null ? Number(r.land_area) : undefined,
              property_type: r.property_type ?? undefined,
              days_on_market: undefined,
              listing_url: r.source_url ?? undefined,
            }));
            usedSource = 'listings';
          }
        }
      }
    } catch (e) {
      console.warn('[market-analysis] comps step failed, continuing', e);
    }

    // 3) Compute stats
    const prices = comps.map((c) => Number(c.sold_price)).filter((n) => Number.isFinite(n) && n > 0);
    const low = prices.length ? Math.min(...prices) : undefined;
    const high = prices.length ? Math.max(...prices) : undefined;
    const med = prices.length ? (median(prices) ?? undefined) : undefined;

    // Price per sqm median from comps with floor area
    const ppsValues: number[] = comps
      .map((c) => (c.sold_price && c.floor_area ? Number(c.sold_price) / Number(c.floor_area) : null))
      .filter((v): v is number => !!v && Number.isFinite(v) && v > 0);
    const medPps = ppsValues.length ? (median(ppsValues) ?? undefined) : undefined;

    // Days on market median (only for sold comps with listing_date)
    const domValues: number[] = comps
      .map((c) => c.days_on_market)
      .filter((v): v is number => typeof v === 'number' && v >= 0);
    const medDom = domValues.length ? Math.round(median(domValues) as number) : undefined;

    // Confidence score based on comps count
    const confidence = Math.max(30, Math.min(95, (comps.length || 0) * 5));

    // 4) Determine estimated ARV with sensible fallbacks
    const MIN_VALID = 10000; // avoid unrealistic tiny values
    let estimatedFrom: 'sold_median' | 'pps_subject' | 'list_median' | 'list_pps_subject' | 'none' = 'none';
    let estimated_arv: number | undefined = undefined;

    const subjectFloor = subject.floor_area ? Number(subject.floor_area) : undefined;

    if (med && med >= MIN_VALID) {
      estimated_arv = med;
      estimatedFrom = 'sold_median';
    } else if (medPps && subjectFloor) {
      const val = medPps * subjectFloor;
      if (val >= MIN_VALID) {
        estimated_arv = val;
        estimatedFrom = 'pps_subject';
      }
    }

    if (!estimated_arv && usedSource === 'listings') {
      // Recompute medians explicitly named for clarity (already computed above as med/medPps)
      if (med && med >= MIN_VALID) {
        estimated_arv = med;
        estimatedFrom = 'list_median';
      } else if (medPps && subjectFloor) {
        const val = medPps * subjectFloor;
        if (val >= MIN_VALID) {
          estimated_arv = val;
          estimatedFrom = 'list_pps_subject';
        }
      }
    }

    // Analysis payload
    const analysis = {
      estimated_arv: estimated_arv ?? undefined,
      market_trend: 'stable' as const,
      avg_days_on_market: medDom ?? undefined,
      price_per_sqm: medPps ? Math.round(medPps) : undefined,
      market_confidence: Math.round(confidence),
      rental_yield: 4.0,
      insights: comps.length
        ? `Based on ${comps.length} ${usedSource === 'sales' ? 'recent sales' : 'recent listings'} in ${subject.city || subject.suburb || 'the area'}.` + (estimatedFrom !== 'none' ? ` Estimate derived from ${estimatedFrom.replace('_', ' ')}.` : '')
        : 'No suitable local comps found; unable to produce a reliable estimate.',
      location_score: undefined,
      price_range: low && high ? { low, high, median: med } : undefined,
    } as any;

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

    console.log('[market-analysis] complete', { dealId, comps: comps.length, usedSource, estimatedFrom });

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
