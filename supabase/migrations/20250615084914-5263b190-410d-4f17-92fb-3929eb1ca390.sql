
-- Create a table to store scraper configuration settings
CREATE TABLE public.scraper_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key TEXT NOT NULL UNIQUE,
  config_value TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert the default trademe endpoint configuration
INSERT INTO public.scraper_config (config_key, config_value, description)
VALUES (
  'trademe_endpoint',
  'https://4419-222-154-21-216.ngrok-free.app',
  'Base URL for the TradeMe scraper service'
);

-- Add trigger to update the updated_at column
CREATE TRIGGER update_scraper_config_updated_at
  BEFORE UPDATE ON public.scraper_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add Row Level Security (RLS) - make it readable by authenticated users
ALTER TABLE public.scraper_config ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to read scraper config
CREATE POLICY "Authenticated users can view scraper config" 
  ON public.scraper_config 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to update scraper config
CREATE POLICY "Authenticated users can update scraper config" 
  ON public.scraper_config 
  FOR UPDATE 
  TO authenticated
  USING (true);

-- Policy to allow authenticated users to insert scraper config
CREATE POLICY "Authenticated users can insert scraper config" 
  ON public.scraper_config 
  FOR INSERT 
  TO authenticated
  WITH CHECK (true);
