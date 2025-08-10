-- Add foreign key relationship so PostgREST can expose nested `unified_properties(*)` on deals
-- Also add an index for performance

DO $$ BEGIN
  -- Only create the index if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE c.relname = 'idx_deals_property_id' AND n.nspname = 'public'
  ) THEN
    CREATE INDEX idx_deals_property_id ON public.deals(property_id);
  END IF;
END $$;

-- Create the foreign key if it doesn't already exist
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema = 'public'
      AND tc.table_name = 'deals'
      AND tc.constraint_type = 'FOREIGN KEY'
      AND tc.constraint_name = 'deals_property_id_fkey'
  ) THEN
    ALTER TABLE public.deals
      ADD CONSTRAINT deals_property_id_fkey
      FOREIGN KEY (property_id)
      REFERENCES public.unified_properties(id)
      ON UPDATE CASCADE
      ON DELETE RESTRICT;
  END IF;
END $$;