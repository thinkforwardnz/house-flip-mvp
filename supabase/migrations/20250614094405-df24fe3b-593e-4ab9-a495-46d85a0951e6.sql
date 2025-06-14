
-- Add renovation_selections field to deals table to store user's renovation choices
ALTER TABLE public.deals 
ADD COLUMN renovation_selections jsonb DEFAULT '{}'::jsonb;

-- Add a comment to document the expected structure
COMMENT ON COLUMN public.deals.renovation_selections IS 'Stores user renovation selections with structure: {"kitchen": {"selected": true, "cost": 25000, "value_add_percent": 6}, "bathroom": {"selected": true, "cost": 15000, "value_add_percent": 4}, "add_bedroom": {"selected": true, "cost": 35000, "value_add_percent": 20}}';
