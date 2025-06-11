
-- Step 1: Add property_id column to deals table
ALTER TABLE public.deals 
ADD COLUMN property_id uuid REFERENCES public.unified_properties(id);

-- Step 2: Create a function to migrate existing deals to unified_properties
CREATE OR REPLACE FUNCTION migrate_deals_to_unified_properties()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    deal_record RECORD;
    found_property_id uuid;
BEGIN
    -- Loop through all deals that have an address
    FOR deal_record IN 
        SELECT id, address, suburb, city, bedrooms, bathrooms, floor_area, land_area, 
               photos, description, coordinates
        FROM public.deals 
        WHERE address IS NOT NULL AND deals.property_id IS NULL
    LOOP
        -- Try to find existing unified property by address
        SELECT up.id INTO found_property_id
        FROM public.unified_properties up
        WHERE up.address = deal_record.address
        LIMIT 1;
        
        -- If no property exists, create one
        IF found_property_id IS NULL THEN
            INSERT INTO public.unified_properties (
                address, suburb, city, bedrooms, bathrooms, 
                floor_area, land_area, photos, description, coordinates
            ) VALUES (
                deal_record.address, deal_record.suburb, deal_record.city,
                deal_record.bedrooms, deal_record.bathrooms,
                deal_record.floor_area, deal_record.land_area,
                deal_record.photos, deal_record.description, deal_record.coordinates
            ) RETURNING id INTO found_property_id;
        END IF;
        
        -- Update the deal with the property_id
        UPDATE public.deals 
        SET property_id = found_property_id
        WHERE id = deal_record.id;
    END LOOP;
END;
$$;

-- Step 3: Run the migration
SELECT migrate_deals_to_unified_properties();

-- Step 4: Make property_id NOT NULL after migration
ALTER TABLE public.deals 
ALTER COLUMN property_id SET NOT NULL;

-- Step 5: Remove redundant property columns from deals
ALTER TABLE public.deals 
DROP COLUMN IF EXISTS address,
DROP COLUMN IF EXISTS suburb, 
DROP COLUMN IF EXISTS city,
DROP COLUMN IF EXISTS bedrooms,
DROP COLUMN IF EXISTS bathrooms,
DROP COLUMN IF EXISTS floor_area,
DROP COLUMN IF EXISTS land_area,
DROP COLUMN IF EXISTS photos,
DROP COLUMN IF EXISTS description,
DROP COLUMN IF EXISTS coordinates;

-- Step 6: Clean up the migration function
DROP FUNCTION migrate_deals_to_unified_properties();
