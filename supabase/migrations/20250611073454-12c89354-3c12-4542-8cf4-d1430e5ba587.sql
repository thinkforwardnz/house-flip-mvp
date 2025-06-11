
-- Create the unified properties table
CREATE TABLE public.unified_properties (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Address and location
  address TEXT NOT NULL,
  suburb TEXT,
  city TEXT DEFAULT 'Auckland',
  district TEXT,
  coordinates POINT,
  
  -- Property specifications
  bedrooms INTEGER,
  bathrooms NUMERIC,
  floor_area NUMERIC,
  land_area NUMERIC,
  property_type TEXT,
  year_built INTEGER,
  parking_spaces INTEGER,
  
  -- Pricing and dates
  current_price NUMERIC,
  price_history JSONB DEFAULT '[]'::jsonb,
  listing_date DATE,
  sale_date DATE,
  
  -- Data sources and tracking
  source_url TEXT,
  source_site TEXT,
  photos TEXT[],
  description TEXT,
  
  -- User and deal associations
  user_id UUID REFERENCES auth.users,
  deal_id UUID,
  
  -- Tags for property lifecycle and enrichment status
  tags TEXT[] DEFAULT '{}',
  
  -- Enrichment data
  linz_data JSONB,
  council_data JSONB,
  market_analysis JSONB,
  ai_analysis JSONB,
  
  -- Analysis scores
  ai_score INTEGER,
  ai_est_profit NUMERIC,
  ai_reno_cost NUMERIC,
  ai_arv NUMERIC,
  flip_potential flip_potential,
  ai_confidence INTEGER,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date_scraped TIMESTAMP WITH TIME ZONE,
  
  -- Status tracking
  status TEXT DEFAULT 'active'
);

-- Create indexes for better performance
CREATE INDEX idx_unified_properties_address ON public.unified_properties(address);
CREATE INDEX idx_unified_properties_suburb ON public.unified_properties(suburb);
CREATE INDEX idx_unified_properties_district ON public.unified_properties(district);
CREATE INDEX idx_unified_properties_tags ON public.unified_properties USING GIN(tags);
CREATE INDEX idx_unified_properties_user_id ON public.unified_properties(user_id);
CREATE INDEX idx_unified_properties_deal_id ON public.unified_properties(deal_id);
CREATE INDEX idx_unified_properties_price ON public.unified_properties(current_price);
CREATE INDEX idx_unified_properties_created_at ON public.unified_properties(created_at);

-- Enable RLS
ALTER TABLE public.unified_properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view all properties" 
  ON public.unified_properties 
  FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert their own properties" 
  ON public.unified_properties 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can update their own properties" 
  ON public.unified_properties 
  FOR UPDATE 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can delete their own properties" 
  ON public.unified_properties 
  FOR DELETE 
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Create trigger for updated_at
CREATE TRIGGER update_unified_properties_updated_at
  BEFORE UPDATE ON public.unified_properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to add tags
CREATE OR REPLACE FUNCTION public.add_property_tag(property_id UUID, new_tag TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.unified_properties 
  SET tags = array_append(tags, new_tag),
      updated_at = now()
  WHERE id = property_id 
    AND NOT (new_tag = ANY(tags));
END;
$$;

-- Create function to remove tags
CREATE OR REPLACE FUNCTION public.remove_property_tag(property_id UUID, tag_to_remove TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.unified_properties 
  SET tags = array_remove(tags, tag_to_remove),
      updated_at = now()
  WHERE id = property_id;
END;
$$;

-- Create function to get properties by tags
CREATE OR REPLACE FUNCTION public.get_properties_by_tags(tag_filters TEXT[])
RETURNS SETOF public.unified_properties
LANGUAGE sql
STABLE
AS $$
  SELECT * FROM public.unified_properties 
  WHERE tags && tag_filters
  ORDER BY created_at DESC;
$$;

-- Migrate data from scraped_listings
INSERT INTO public.unified_properties (
  address, suburb, city, district, bedrooms, bathrooms, floor_area, land_area,
  current_price, listing_date, source_url, source_site, photos, description,
  ai_score, ai_est_profit, ai_reno_cost, ai_arv, flip_potential, ai_confidence,
  created_at, updated_at, date_scraped, tags
)
SELECT 
  address, suburb, city, district, bedrooms, bathrooms, floor_area, land_area,
  price, listing_date, source_url, source_site, photos, summary,
  ai_score, ai_est_profit, ai_reno_cost, ai_arv, flip_potential, ai_confidence,
  created_at, updated_at, date_scraped,
  CASE 
    WHEN status = 'new' THEN ARRAY['prospecting']
    WHEN status = 'saved' THEN ARRAY['prospecting', 'saved']
    WHEN status = 'dismissed' THEN ARRAY['prospecting', 'dismissed']
    WHEN status = 'imported' THEN ARRAY['prospecting', 'imported']
    ELSE ARRAY['prospecting']
  END as tags
FROM public.scraped_listings;

-- Migrate data from deals
INSERT INTO public.unified_properties (
  address, suburb, city, bedrooms, bathrooms, floor_area, land_area,
  current_price, photos, description, user_id, deal_id,
  created_at, updated_at, tags, market_analysis, ai_analysis
)
SELECT 
  d.address, d.suburb, d.city, d.bedrooms, d.bathrooms, d.floor_area, d.land_area,
  COALESCE(d.purchase_price, d.target_sale_price), d.photos, d.description, d.user_id, d.id,
  d.created_at, d.updated_at,
  CASE d.pipeline_stage
    WHEN 'Analysis' THEN ARRAY['deal', 'analysis']
    WHEN 'Offer' THEN ARRAY['deal', 'offer']
    WHEN 'Under Contract' THEN ARRAY['deal', 'under_contract']
    WHEN 'Reno' THEN ARRAY['deal', 'renovation']
    WHEN 'Listed' THEN ARRAY['deal', 'listed']
    WHEN 'Sold' THEN ARRAY['deal', 'sold']
    ELSE ARRAY['deal']
  END as tags,
  d.market_analysis, d.analysis_data
FROM public.deals d
ON CONFLICT DO NOTHING;

-- Update properties from the properties table
UPDATE public.unified_properties up
SET 
  property_type = p.property_type,
  year_built = p.year_built,
  parking_spaces = p.parking_spaces,
  source_url = COALESCE(up.source_url, p.listing_url),
  photos = COALESCE(up.photos, p.listing_photos)
FROM public.properties p
WHERE up.deal_id = p.deal_id;
