
-- Allow users to update deals they can access (owner or team member)
-- Uses existing can_access_deal(deal_uuid) helper to align with other tables.
CREATE POLICY "Users can update accessible deals"
ON public.deals
FOR UPDATE
USING (can_access_deal(id))
WITH CHECK (can_access_deal(id));
