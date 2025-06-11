
-- Drop the user_scraped_listing_actions table first (has foreign key to scraped_listings)
DROP TABLE IF EXISTS public.user_scraped_listing_actions;

-- Drop the properties table
DROP TABLE IF EXISTS public.properties;

-- Drop the scraped_listings table
DROP TABLE IF EXISTS public.scraped_listings;

-- Clean up any remaining functions that might reference these tables
DROP FUNCTION IF EXISTS public.get_user_listing_status(uuid, uuid);
DROP FUNCTION IF EXISTS public.update_scraped_listings_updated_at();
