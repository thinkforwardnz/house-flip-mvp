-- Add archive fields to deals table
ALTER TABLE public.deals 
ADD COLUMN archived boolean NOT NULL DEFAULT false,
ADD COLUMN archived_at timestamp with time zone DEFAULT NULL;

-- Create index for better performance when filtering archived deals
CREATE INDEX idx_deals_archived ON public.deals(archived, archived_at);

-- Update the existing RLS policies to handle archived deals
-- No changes needed as the existing policies already handle all operations based on user/team access